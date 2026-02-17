"""
WhatsApp messaging service via Facebook Graph API.
Sends missed medicine alerts to caretakers.
"""
import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger(__name__)

WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
WHATSAPP_API_URL = f"https://graph.facebook.com/v22.0/{WHATSAPP_PHONE_ID}/messages"


def send_whatsapp_message(to_phone: str, message_body: str) -> bool:
    """
    Send a free-form text WhatsApp message to a phone number.
    
    Args:
        to_phone: Phone number with country code, no '+' (e.g. '916005231146')
        message_body: The text message to send
    
    Returns:
        True if sent successfully, False otherwise
    """
    if not WHATSAPP_PHONE_ID or not WHATSAPP_TOKEN:
        logger.warning("WhatsApp credentials not configured, skipping message")
        return False

    # Strip any non-digit chars (like +, spaces, dashes)
    to_phone = "".join(c for c in to_phone if c.isdigit())

    if not to_phone:
        logger.warning("No valid phone number provided for WhatsApp message")
        return False

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": message_body},
    }

    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post(WHATSAPP_API_URL, json=payload, headers=headers)

        if resp.status_code in (200, 201):
            logger.info(f"WhatsApp message sent to {to_phone}")
            return True
        else:
            logger.error(f"WhatsApp API error {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {e}")
        return False


def send_missed_medicine_alert(
    caretaker_phone: str,
    caretaker_name: str,
    user_name: str,
    medicine_name: str,
    dosage: str | None = None,
    reminder_time: str | None = None,
) -> bool:
    """
    Send a missed medicine alert to a caretaker via WhatsApp.
    """
    med_info = medicine_name
    if dosage:
        med_info += f" ({dosage})"

    time_str = f" scheduled at {reminder_time}" if reminder_time else ""

    message = (
        f"⚠️ *LifeBuddy Alert*\n\n"
        f"Hi {caretaker_name},\n\n"
        f"{user_name} has not taken their medicine:\n"
        f"💊 *{med_info}*{time_str}\n\n"
        f"Please check in with them.\n"
        f"— LifeBuddy Care"
    )

    return send_whatsapp_message(caretaker_phone, message)


def send_medicine_reminder(
    user_phone: str,
    user_name: str,
    medicine_name: str,
    dosage: str | None = None,
) -> bool:
    """
    Send a medicine reminder directly to the user via WhatsApp.
    """
    med_info = medicine_name
    if dosage:
        med_info += f" ({dosage})"

    message = (
        f"💊 *Medicine Reminder*\n\n"
        f"Hi {user_name},\n\n"
        f"It's time to take your medicine:\n"
        f"💊 *{med_info}*\n\n"
        f"Stay healthy! 💪\n"
        f"— LifeBuddy"
    )

    return send_whatsapp_message(user_phone, message)
