"""
Background scheduler for sending push notifications for medicine reminders and events.
Runs in a separate thread, checks every 60 seconds.
"""
import threading
import time
import logging
import sys
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.v2_models import Medicine, MedicineLog, Event
from app.models.push_subscription import PushSubscription
from app.models.care import CareLink
from app.models.user import User
from app.services.push_service import send_push_to_user
from app.services.whatsapp_service import send_missed_medicine_alert, send_medicine_reminder

logger = logging.getLogger(__name__)

# Also log to stdout so it shows in uvicorn output
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Track which notifications we've already sent today (to avoid duplicates)
_sent_notifications = set()


def _clear_sent_at_midnight():
    """Clear sent notifications tracker at midnight."""
    global _sent_notifications
    _sent_notifications = set()


def check_and_send_reminders():
    """Check for upcoming medicine reminders and events, send push notifications."""
    db: Session = SessionLocal()
    try:
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        today = date.today()

        # Check how many subscriptions exist
        sub_count = db.query(PushSubscription).count()

        # --- Medicine Reminders ---
        medicines = db.query(Medicine).filter(
            Medicine.reminder_time.isnot(None),
            Medicine.reminder_time != ""
        ).all()

        if medicines:
            logger.info(f"[Scheduler] Checking {len(medicines)} medicines at {current_time}, {sub_count} push subscriptions active")

        for med in medicines:
            reminder_key = f"med-{med.id}-{today}"
            if reminder_key in _sent_notifications:
                continue

            # Check if the reminder time matches current time (within 1 minute)
            try:
                rem_h, rem_m = med.reminder_time.split(":")
                rem_h, rem_m = int(rem_h), int(rem_m)
                cur_h, cur_m = now.hour, now.minute

                if rem_h == cur_h and rem_m == cur_m:
                    # Check if medicine was already taken today
                    taken_log = db.query(MedicineLog).filter(
                        MedicineLog.medicine_id == med.id,
                        MedicineLog.date == today,
                        MedicineLog.taken == True
                    ).first()

                    if not taken_log:
                        # Push notification
                        send_push_to_user(
                            db, med.user_id,
                            title="💊 Medicine Reminder",
                            body=f"Time to take {med.name}" + (f" ({med.dosage})" if med.dosage else ""),
                            icon="💊",
                            url="/calendar",
                            tag=f"med-{med.id}"
                        )
                        logger.info(f"Sent medicine reminder for {med.name} to user {med.user_id}")

                        # WhatsApp to user themselves
                        user = db.query(User).filter(User.id == med.user_id).first()
                        if user and user.phone:
                            send_medicine_reminder(
                                user_phone=user.phone,
                                user_name=user.name or "there",
                                medicine_name=med.name,
                                dosage=med.dosage,
                            )
                            logger.info(f"WhatsApp reminder sent to user {user.name} ({user.phone})")

                        # WhatsApp to caretakers
                        user_name = user.name if user else "Your ward"
                        care_links = db.query(CareLink).filter(
                            CareLink.user_id == med.user_id,
                            CareLink.status == "active"
                        ).all()
                        for link in care_links:
                            caretaker = db.query(User).filter(User.id == link.caretaker_id).first()
                            if caretaker and caretaker.phone:
                                send_missed_medicine_alert(
                                    caretaker_phone=caretaker.phone,
                                    caretaker_name=caretaker.name or "Caretaker",
                                    user_name=user_name,
                                    medicine_name=med.name,
                                    dosage=med.dosage,
                                    reminder_time=med.reminder_time,
                                )
                                logger.info(f"WhatsApp alert sent to caretaker {caretaker.name} ({caretaker.phone})")

                        _sent_notifications.add(reminder_key)
            except Exception as e:
                logger.error(f"Error processing medicine reminder {med.id}: {e}")

        # --- Event Reminders (30 min before) ---
        events = db.query(Event).filter(
            Event.event_date == today,
            Event.event_time.isnot(None),
            Event.event_time != ""
        ).all()

        for event in events:
            event_key = f"event-{event.id}-{today}"
            if event_key in _sent_notifications:
                continue

            try:
                ev_h, ev_m = event.event_time.split(":")
                ev_h, ev_m = int(ev_h), int(ev_m)

                # Send 30 minutes before
                event_dt = now.replace(hour=ev_h, minute=ev_m, second=0, microsecond=0)
                diff_min = (event_dt - now).total_seconds() / 60

                # Notify between 29-31 minutes before (1-minute window)
                if 29 <= diff_min <= 31:
                    send_push_to_user(
                        db, event.user_id,
                        title=f"📅 Event in 30 min",
                        body=f"{event.title}" + (f" at {event.event_time}" if event.event_time else ""),
                        icon="📅",
                        url="/calendar",
                        tag=f"event-{event.id}"
                    )
                    _sent_notifications.add(event_key)
                    logger.info(f"Sent event reminder for {event.title} to user {event.user_id}")

                # Also notify at event time
                event_now_key = f"event-now-{event.id}-{today}"
                if event_now_key not in _sent_notifications and ev_h == now.hour and ev_m == now.minute:
                    send_push_to_user(
                        db, event.user_id,
                        title=f"📅 {event.title} - Now!",
                        body=f"Your event is starting now",
                        icon="📅",
                        url="/calendar",
                        tag=f"event-now-{event.id}"
                    )
                    _sent_notifications.add(event_now_key)
            except Exception as e:
                logger.error(f"Error processing event reminder {event.id}: {e}")

        # Clear sent notifications at midnight
        if now.hour == 0 and now.minute == 0:
            _clear_sent_at_midnight()



    except Exception as e:
        logger.error(f"Scheduler error: {e}")
    finally:
        db.close()


def _scheduler_loop():
    """Main scheduler loop — runs check_and_send_reminders every 60 seconds."""
    logger.info("Push notification scheduler started")
    while True:
        try:
            check_and_send_reminders()
        except Exception as e:
            logger.error(f"Scheduler loop error: {e}")
        time.sleep(60)  # Check every minute


def start_scheduler():
    """Start the background scheduler thread."""
    thread = threading.Thread(target=_scheduler_loop, daemon=True, name="push-scheduler")
    thread.start()
    logger.info("Push notification scheduler thread started")
