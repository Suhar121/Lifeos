import sys
import os
import requests
import json
from datetime import date, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
EMAIL = "test_v2@example.com"
PASSWORD = "password123"
NAME = "V2 Tester"

def register_and_login():
    print("\n--- 1. Authentication ---")
    # Register
    try:
        requests.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD, "name": NAME})
    except:
        pass # Ignore if already exists

    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        sys.exit(1)
    
    token = response.json()["access_token"]
    print("Login successful.")
    return {"Authorization": f"Bearer {token}"}

def test_calendar(headers):
    print("\n--- 2. Calendar API ---")
    # Create Event
    event_data = {
        "title": "Doctor Appointment",
        "description": "Annual checkup",
        "event_type": "appointment",
        "event_date": str(date.today())
    }
    res = requests.post(f"{BASE_URL}/calendar/events", json=event_data, headers=headers)
    if res.status_code == 200:
        print("Event created successfully.")
    else:
        print(f"Event creation failed: {res.text}")

    # Create Medicine
    med_data = {
        "name": "Vitamin D",
        "dosage": "1000IU",
        "frequency": "Daily",
        "reminder_time": "08:00:00"
    }
    res = requests.post(f"{BASE_URL}/calendar/medicines", json=med_data, headers=headers)
    if res.status_code == 200:
        print("Medicine created successfully.")
        med_id = res.json()["id"]
        
        # Log Medicine
        log_data = {"medicine_id": med_id, "taken": True, "date": str(date.today())}
        res = requests.post(f"{BASE_URL}/calendar/medicines/log", json=log_data, headers=headers)
        if res.status_code == 200:
            print("Medicine logged successfully.")
        else:
            print(f"Medicine logging failed: {res.text}")
    else:
        print(f"Medicine creation failed: {res.text}")

def test_life_score(headers):
    print("\n--- 3. Life Score ---")
    # Create a Daily Log to generate score
    log_data = {
        "mood": "happy",
        "energy": 8,
        "focus": 9,
        "sleep_hours": 7.5,
        "productivity": 8,
        "workout": True,
        "notes": "Great V2 day"
    }
    res = requests.post(f"{BASE_URL}/daily-logs/", json=log_data, headers=headers)
    if res.status_code == 200:
        print("Daily Log created.")
        print(f"Calculated Life Score: {res.json().get('life_score')}")
    else:
        print(f"Daily Log creation failed: {res.text}")

    # Get Weekly Score
    res = requests.get(f"{BASE_URL}/life-score/weekly", headers=headers)
    if res.status_code == 200:
        data = res.json()
        print(f"Weekly Average Score: {data['average_score']}")
    else:
        print(f"Get Weekly Score failed: {res.text}")

def test_weekly_report(headers):
    print("\n--- 4. Weekly AI Report ---")
    res = requests.post(f"{BASE_URL}/ai/weekly-report", headers=headers)
    if res.status_code == 200:
        data = res.json()
        print("Weekly Report Generated:")
        print(json.dumps(data['report_data'], indent=2))
    else:
        print(f"Weekly Report generation failed: {res.text}")

if __name__ == "__main__":
    try:
        headers = register_and_login()
        test_calendar(headers)
        test_life_score(headers)
        test_weekly_report(headers)
        print("\n--- V2 Backend Verification Complete ---")
    except Exception as e:
        print(f"\nError: {e}")
