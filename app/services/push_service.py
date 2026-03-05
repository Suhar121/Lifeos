import json
import os
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from sqlalchemy.orm import Session
from app.models.push_subscription import PushSubscription

logger = logging.getLogger(__name__)

# --- Firebase Admin SDK Initialization ---
# Option 1: Use a service account JSON file (recommended for production)
# Set FIREBASE_SERVICE_ACCOUNT_PATH env var to the path of your service account JSON file
# Option 2: Use GOOGLE_APPLICATION_CREDENTIALS env var (standard GCP auth)
# Option 3: Default credentials (works on GCP, Cloud Run, etc.)

_firebase_initialized = False

def _init_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            logger.info(f"Firebase Admin initialized with service account: {service_account_path}")
        else:
            # Try default credentials (GOOGLE_APPLICATION_CREDENTIALS env var or GCP metadata)
            firebase_admin.initialize_app()
            logger.info("Firebase Admin initialized with default credentials")
        _firebase_initialized = True
    except ValueError:
        # Already initialized
        _firebase_initialized = True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        logger.error("Set FIREBASE_SERVICE_ACCOUNT_PATH to your service account JSON file path")


def send_fcm_notification(fcm_token: str, title: str, body: str, icon: str = "💊", url: str = "/calendar", tag: str = "lifeos"):
    """Send a single push notification via Firebase Cloud Messaging."""
    _init_firebase()

    # FCM requires absolute HTTPS URLs for webpush link
    base_url = os.getenv("APP_BASE_URL", "https://lifebuddy.dpdns.org")
    absolute_url = url if url.startswith("http") else f"{base_url}{url}"

    message = messaging.Message(
        token=fcm_token,
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data={
            "title": title,
            "body": body,
            "icon": icon,
            "url": url,
            "tag": tag,
        },
        webpush=messaging.WebpushConfig(
            notification=messaging.WebpushNotification(
                title=title,
                body=body,
                icon="/icon.svg",
                badge="/icon.svg",
                tag=tag,
                renotify=True,
                require_interaction=True,
                vibrate=[200, 100, 200, 100, 200],
            ),
            fcm_options=messaging.WebpushFCMOptions(
                link=absolute_url,
            ),
        ),
    )

    try:
        logger.info(f"Sending FCM notification to token: {fcm_token[:20]}...")
        response = messaging.send(message)
        logger.info(f"FCM notification sent successfully. Message ID: {response}")
        return True
    except messaging.UnregisteredError:
        logger.warning(f"FCM token is unregistered/expired, marking for removal")
        return False  # Token invalid, should be removed
    except messaging.SenderIdMismatchError:
        logger.warning(f"FCM sender ID mismatch, marking for removal")
        return False
    except Exception as e:
        logger.error(f"FCM notification failed: {e}")
        return None  # Other error, don't remove


def send_push_to_user(db: Session, user_id: str, title: str, body: str, icon: str = "💊", url: str = "/calendar", tag: str = "lifeos"):
    """Send push notification to all FCM subscriptions of a user."""
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()

    for sub in subs:
        if sub.fcm_token:
            # Use Firebase Cloud Messaging
            result = send_fcm_notification(sub.fcm_token, title, body, icon, url, tag)
            if result is False:
                # Token expired/invalid, remove it
                db.delete(sub)
                db.commit()
                logger.info(f"Removed expired FCM subscription {sub.id}")

