import csv
import json
import requests
import argparse
import sys

def populate_questions(csv_file, api_base_url, email=None, password=None):
    session = requests.Session()
    
    # Authentication Step
    if email and password:
        print(f"Attempting to login as {email}...")
        auth_url = f"{api_base_url}/auth"
        auth_payload = {
            "action": "signInWithEmail",
            "email": email,
            "password": password
        }
        
        try:
            response = session.post(auth_url, json=auth_payload)
            if response.status_code in [200, 302]:
                print("  Login successful!")
            else:
                print(f"  Login failed with status {response.status_code}: {response.text}")
                return
        except Exception as e:
            print(f"  Error during login: {e}")
            return
    else:
        print("No credentials provided. Proceeding without authentication (may fail if API is protected).")

    questions_url = f"{api_base_url}/questions"
    
    try:
        with open(csv_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            success_count = 0
            fail_count = 0
            
            for row in reader:
                # Prepare data structure for the API
                payload = {
                    "question": row['question'],
                    "options": {
                        "A": row['optionA'],
                        "B": row['optionB'],
                        "C": row['optionC'],
                        "D": row['optionD']
                    },
                    "correctAnswer": row['correctAnswer'],
                    "tags": [tag.strip() for tag in row['tags'].split(',')],
                    "categoryId": int(row['categoryId'])
                }
                
                print(f"Submitting question: {payload['question'][:50]}...")
                
                try:
                    response = session.post(questions_url, json=payload)
                    
                    if response.status_code == 200 or response.status_code == 201:
                        print(f"  Successfully added!")
                        success_count += 1
                    else:
                        print(f"  Failed with status {response.status_code}: {response.text}")
                        fail_count += 1
                except Exception as e:
                    print(f"  Error sending request: {e}")
                    fail_count += 1
            
            print("\nSummary:")
            print(f"  Successfully added: {success_count}")
            print(f"  Failed: {fail_count}")

    except FileNotFoundError:
        print(f"Error: File '{csv_file}' not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Populate questions from a CSV file via API.')
    parser.add_argument('--csv', default='scripts/questions.csv', help='Path to the CSV file (default: scripts/questions.csv)')
    parser.add_argument('--base-url', default='http://localhost:3000/api/v1', help='API Base URL (default: http://localhost:3000/api/v1)')
    parser.add_argument('--email', help='Email for authentication')
    parser.add_argument('--password', help='Password for authentication')

    args = parser.parse_args()
    
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("Error: 'requests' library is not installed. Please install it using 'pip install requests'.")
        sys.exit(1)

    populate_questions(args.csv, args.base_url, args.email, args.password)
