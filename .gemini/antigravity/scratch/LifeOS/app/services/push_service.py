import json
import os
import logging
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.models.push_subscription import PushSubscription

logger = logging.getLogger(__name__)

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "mailto:admin@lifebuddy.dpdns.org")


def send_push_notification(subscription_info: dict, title: str, body: str, icon: str = "💊", url: str = "/calendar", tag: str = "lifeos"):
    """Send a single push notification."""
    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": icon,
        "url": url,
        "tag": tag,
    })

    try:
        logger.info(f"Sending push to {subscription_info['endpoint'][:60]}...")
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_CLAIM_EMAIL}
        )
        logger.info("Push notification sent successfully")
        return True
    except WebPushException as e:
        logger.error(f"Push notification failed: {e}")
        # If subscription is expired/invalid (410 Gone or 404), return False to signal removal
        if hasattr(e, 'response') and e.response is not None:
            if e.response.status_code in (404, 410):
                logger.warning(f"Subscription expired (status {e.response.status_code}), marking for removal")
                return False
        return None  # Other error, don't remove
    except Exception as e:
        logger.error(f"Unexpected push error: {e}")
        return None


def send_push_to_user(db: Session, user_id: str, title: str, body: str, icon: str = "💊", url: str = "/calendar", tag: str = "lifeos"):
    """Send push notification to all subscriptions of a user."""
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()

    for sub in subs:
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }
        }
        result = send_push_notification(subscription_info, title, body, icon, url, tag)
        if result is False:
            # Subscription expired, remove it
            db.delete(sub)
            db.commit()
            logger.info(f"Removed expired push subscription {sub.id}")
