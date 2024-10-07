from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from flask_mysqldb import MySQL
from datetime import datetime, timedelta, time
from werkzeug.utils import secure_filename
import os
import uuid
import string
import random
from werkzeug.security import generate_password_hash, check_password_hash
import shutil
import json
import pandas as pd
from io import BytesIO
import threading
import cv2
from ultralytics import YOLO
from deepface import DeepFace
# from your_flask_app import app

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


app.config['MYSQL_HOST'] = 'db'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'pass@word'
app.config['MYSQL_DB'] = 'attendit_db'

mysql = MySQL(app)

# Load OpenCV Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Configuring the upload folder
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['UPLOAD_FOLDER_URL'] = 'http://localhost:5000/uploads'  # Update with your domain and port

if not os.path.exists(app.config['UPLOAD_FOLDER']):
	os.makedirs(app.config['UPLOAD_FOLDER'])

def generate_unique_id(length=12):
	characters = string.ascii_letters + string.digits
	return ''.join(random.choice(characters) for _ in range(length))

# Serve files from the event-specific folder
@app.route('/uploads/<event_id>/<path:filename>')
def uploaded_file(event_id, filename):
	# Construct the path to the event folder
	event_folder = os.path.join(app.config['UPLOAD_FOLDER'], event_id)
	
	# Check if the event folder exists
	if not os.path.exists(event_folder):
		return abort(404, description="Event folder not found")
	
	# Serve the file from the event folder
	return send_from_directory(event_folder, filename)

def run_yolo_face_tracking_webcam(event_id, mysql, threshold_dist=0.7):
	model = YOLO('videos/best.pt')  # Load YOLO model
	cap = cv2.VideoCapture('videos/IMG_9215.MOV')

	if not cap.isOpened():
		print("Error: Could not open video.")
		return

	while True:
		ret, frame = cap.read()
		if not ret:
			break

		results = model.track(frame, persist=True)
		if hasattr(results[0].boxes, 'id'):
			boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
			with app.app_context():
				# Get invitees for the event from DB
				cursor = mysql.connection.cursor()
				cursor.execute('''
					SELECT i.invitee_id, i.cropped_photo, i.timestamps
					FROM events e
					JOIN invitees i ON e.event_id = i.event_id
					WHERE e.event_id = %s
				''', (event_id,))
				invitees = cursor.fetchall()
				cursor.close()

				# Folder where reference images for the event are stored
				event_folder = os.path.join(app.config['UPLOAD_FOLDER'], str(event_id))
				cropped_faces_folder = os.path.join(event_folder, 'cropped_faces')

				for box in boxes:
					cropped_image = frame[box[1]:box[3], box[0]:box[2]]
					
					for invitee in invitees:
						invitee_id, reference_image , timestamps = invitee
						# Verify face using DeepFace
						result = DeepFace.verify(cropped_image, os.path.join(cropped_faces_folder, reference_image), model_name='Facenet512')

						# If match is found based on the threshold
						if result['distance'] < threshold_dist:
							print('Match found')
							# Retrieve and update timestamps
							current_time = datetime.now().strftime('%H:%M:%S')

							if timestamps:
								timestamps_data = json.loads(timestamps)
							else:
								timestamps_data = {'arrivals': [], 'departures': []}

							# Append the current time to the `arrivals` or `departures`
							if len(timestamps_data['arrivals']) == len(timestamps_data['departures']):
								timestamps_data['arrivals'].append(current_time)
							else:
								timestamps_data['departures'].append(current_time)

							# Convert the updated timestamps back to JSON format
							updated_timestamps = json.dumps(timestamps_data)

							# Update the invitee's timestamps in the database
							cursor = mysql.connection.cursor()
							cursor.execute('''
								UPDATE invitees
								SET timestamps = %s
								WHERE invitee_id = %s
							''', (updated_timestamps, invitee_id))
							mysql.connection.commit()
							cursor.close()

						elif result['distance'] > threshold_dist:
							print('No match')
							new_invitee_id = generate_unique_id(10)
							unknown_filename = f"{new_invitee_id}_cropped_unknown.jpg"
							cropped_face_path = os.path.join(cropped_faces_folder, unknown_filename)
							cv2.imwrite(cropped_face_path, cropped_image)

							current_time = datetime.now().strftime('%H:%M:%S')
							timestamps_data = {
								'arrivals': [current_time],
								'departures': []
							}
							updated_timestamps = json.dumps(timestamps_data)

							# Insert the unknown invitee into the database
							cursor = mysql.connection.cursor()
							cursor.execute('''
								INSERT INTO invitees (invitee_id, name, phone_number, photo, cropped_photo, timestamps, event_id)
								VALUES (%s, %s, %s, %s, %s, %s, %s)
							''', (
								new_invitee_id, 'Unknown', '00000000000', unknown_filename, unknown_filename, updated_timestamps, event_id
							))
							mysql.connection.commit()
							cursor.close()

		# Display and check for exit command
		# cv2.imshow("YOLO Face Tracking", frame)
		# if cv2.waitKey(1) & 0xFF == ord("q"):
		# 		break
		count = 0
		cv2.imwrite(f"output_frame_{count}.jpg", frame)
		count += 1

	cap.release()
	cv2.destroyAllWindows()

# Scheduler to start and stop tracking based on event timing
def check_event_timing_and_track(event_id, mysql):
	with app.app_context():
		cursor = mysql.connection.cursor()
		cursor.execute('SELECT event_date, start_time, end_time FROM events WHERE event_id = %s', (event_id,))
		event = cursor.fetchone()

		if not event:
			print(f"Event ID {event_id} not found.")
			return

		event_date = event[0]
		event_start_time = event[1]
		event_end_time = event[2]

		# Combine event date and start/end time into datetime objects
		event_start_datetime = datetime.combine(event_date, event_start_time) - timedelta(minutes=30)  # 30 minutes before event
		event_end_datetime = datetime.combine(event_date, event_end_time) + timedelta(minutes=30)  # 30 minutes after event

		current_time = datetime.now()

		# Calculate time to sleep until 30 minutes before the event starts
		if current_time < event_start_datetime:
			time_until_start = (event_start_datetime - current_time).total_seconds()
			print(f"Waiting {time_until_start} seconds until tracking starts (30 minutes before event).")
			time.sleep(time_until_start)  # Sleep until 30 minutes before event start time

		# Start tracking 30 minutes before the event
		print("Starting YOLO face tracking (30 minutes before event).")
		run_yolo_face_tracking_webcam(event_id, mysql)

		# Calculate time to sleep until 30 minutes after the event ends
		time_until_end = (event_end_datetime - datetime.now()).total_seconds()

		if time_until_end > 0:
			print(f"Tracking for {time_until_end} seconds until tracking ends (30 minutes after event).")
			time.sleep(time_until_end)

		# Stop tracking 30 minutes after the event ends
		print("Event is over. Stopping tracking (30 minutes after event).")
		return

# Function to start the tracking thread
def start_tracking_thread(event_id, mysql):
	tracking_thread = threading.Thread(target=check_event_timing_and_track, args=(event_id, mysql))
	tracking_thread.start()

run_yolo_face_tracking_webcam('9EHZc3fXFDqw', mysql)

# ENDPOINTS
@app.route('/signup', methods=['POST'])
def signup():
	try:
		data = request.json
		name = data['name']
		email = data['email']
		password = data['password']

		cursor = mysql.connection.cursor()

		# Check if email already exists
		cursor.execute('SELECT * FROM organisations WHERE email = %s', (email,))
		existing_user = cursor.fetchone()
		if existing_user:
			cursor.close()
			return jsonify({'error': 'Email already exists'}), 409

		# Generate a unique 12-character ID
		unique_id = generate_unique_id()

		# Hash the password
		hashed_password = generate_password_hash(password)

		# Insert the new organization into the database
		cursor.execute('''
			INSERT INTO organisations (id, name, email, password)
			VALUES (%s, %s, %s, %s)
		''', (unique_id, name, email, hashed_password))
		mysql.connection.commit()
		cursor.close()

		return jsonify({'message': 'Signup successful', 'id': unique_id}), 201

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/signin', methods=['POST'])
def signin():
	try:
		data = request.json
		email = data['email']
		password = data['password']

		cursor = mysql.connection.cursor()

		# Check if email exists
		cursor.execute('SELECT * FROM organisations WHERE email = %s', (email,))
		user = cursor.fetchone()

		if not user:
			cursor.close()
			return jsonify({'error': 'User doesn\'t exist'}), 404

		# Verify password
		unique_id, name, email, hashed_password = user
		if not check_password_hash(hashed_password, password):
			cursor.close()
			return jsonify({'error': 'Invalid email or password'}), 401

		cursor.close()
		return jsonify({'message': 'Signin successful', 'id': unique_id, 'name': name}), 200
	
	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/register-event', methods=['POST'])
def register_event():
	try:
		data = request.json
		event_name = data['event_name']
		event_date = data['event_date']
		start_time = data['start_time']
		end_time = data['end_time']
		location = data['location']
		organisation_id = data['organisation_id']
		
		cursor = mysql.connection.cursor()

		# Check if organisation exists
		cursor.execute('SELECT * FROM organisations WHERE id = %s', (organisation_id,))
		organisation = cursor.fetchone()
		if not organisation:
			cursor.close()
			return jsonify({'error': 'Invalid organisation ID'}), 404

		event_id = generate_unique_id()

		cursor.execute('''
			INSERT INTO events (event_id, event_name, event_date, start_time, end_time, location, organisation_id)
			VALUES (%s, %s, %s, %s, %s, %s, %s)
		''', (event_id, event_name, event_date, start_time, end_time, location, organisation_id))
		mysql.connection.commit()
		cursor.close()

		# Trigger tracking thread right after the event is created
		start_tracking_thread('9EHZc3fXFDqw', mysql)
		
		return jsonify({'success': True, 'event_id': event_id}), 201

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/get-events/<organisation_id>', methods=['GET'])
def get_events(organisation_id):
	try:
		cursor = mysql.connection.cursor()
		cursor.execute('SELECT * FROM events WHERE organisation_id = %s', (organisation_id,))
		events = cursor.fetchall()
		cursor.close()

		# Transform the events into a list of dictionaries for easy JSON serialization
		event_list = []
		for event in events:
			event_dict = {
				'event_id': event[0],
				'event_name': event[1],
				'event_date': event[2].strftime('%Y-%m-%d'),
				'start_time': str(event[3]),
				'end_time': str(event[4]),
				'location': event[5],
			}    
			event_list.append(event_dict)

		return jsonify(event_list), 200

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500
	
@app.route('/delete-event', methods=['DELETE'])
def delete_event():
    try:
        # Get the event_id from the request data
        data = request.json
        event_id = data.get('event_id')

        if not event_id:
            return jsonify({'error': 'Event ID is required'}), 400

        cursor = mysql.connection.cursor()

        # Check if the event exists
        cursor.execute('SELECT * FROM events WHERE event_id = %s', (event_id,))
        event = cursor.fetchone()
        if event is None:
            cursor.close()
            return jsonify({'error': 'Event not found'}), 404

        # Get all invitee_ids associated with the event
        cursor.execute('SELECT invitee_id, photo FROM invitees WHERE event_id = %s', (event_id,))
        invitees = cursor.fetchall()

        # Delete associated records from Invitees table
        cursor.execute('DELETE FROM invitees WHERE event_id = %s', (event_id,))

        # Remove associated photos for each invitee
        event_folder = os.path.join(app.config['UPLOAD_FOLDER'], event_id)
        if os.path.exists(event_folder):
          shutil.rmtree(event_folder)  # Deletes the folder and its contents

        # Delete the event
        cursor.execute('DELETE FROM events WHERE event_id = %s', (event_id,))

        # Commit the transaction
        mysql.connection.commit()
        cursor.close()

        return jsonify({'message': 'Event and associated invitees deleted successfully'}), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/add-invitee', methods=['POST'])
def add_invitee():
	try:
		# Get form data
		event_id = request.form['event_id']
		invitee_id = request.form['invitee_id']
		name = request.form['name']
		phone_number = request.form['phone_number']
		
		# Check if event exists
		cursor = mysql.connection.cursor()
		cursor.execute('SELECT event_id FROM events WHERE event_id = %s', (event_id,))
		event = cursor.fetchone()
		
		if event:
			# Create event-specific folder for photos
			event_folder = os.path.join(app.config['UPLOAD_FOLDER'], event_id)
			cropped_faces_folder = os.path.join(event_folder, 'cropped_faces')

			if not os.path.exists(event_folder):
				os.makedirs(event_folder)
			if not os.path.exists(cropped_faces_folder):
				os.makedirs(cropped_faces_folder)
			
			# Handle file upload for the invitee
			photo = request.files.get('photo', None)  # Expecting a file input named 'photo'
			if photo is None:
					return jsonify({'error': 'No photo file for invitee'}), 400

			filename = secure_filename(photo.filename)
			photo_filename = str(uuid.uuid4()) + "_" + filename
			photo_path = os.path.join(event_folder, photo_filename)  # Save to event folder
			photo.save(photo_path)

			# Load the image for face detection
			image = cv2.imread(photo_path)
			gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

			# Detect faces
			faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
			if len(faces) == 0:
				return jsonify({'error': 'No face detected in the image'}), 400

			# Crop the face and save the cropped version
			for (x, y, w, h) in faces:
				# Crop the face
				cropped_face = image[y:y+h, x:x+w]
				cropped_filename = str(uuid.uuid4()) + "_cropped_" + filename
				cropped_face_path = os.path.join(cropped_faces_folder, cropped_filename)

				# Save the cropped face
				cv2.imwrite(cropped_face_path, cropped_face)

			# Insert invitee data into the database
			cursor.execute('''
				INSERT INTO invitees (invitee_id, name, phone_number, photo, cropped_photo, event_id)
				VALUES (%s, %s, %s, %s, %s, %s)
				''', (
					invitee_id, name, phone_number, photo_filename, cropped_filename, event_id
			))

			mysql.connection.commit()
			cursor.close()

			return jsonify({'message': 'Invitee added successfully'}), 201
		else:
			cursor.close()
			return jsonify({'error': 'Event does not exist'}), 404
			
	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/delete-invitee', methods=['DELETE'])
def delete_invitee():
	try:
		# Get the invitee_id from the request data
		data = request.json
		invitee_id = data.get('invitee_id')
		
		if not invitee_id:
			return jsonify({'error': 'Invitee ID is required'}), 400

		# Check if the invitee exists
		cursor = mysql.connection.cursor()
		cursor.execute('SELECT photo, cropped_photo, event_id FROM invitees WHERE invitee_id = %s', (invitee_id,))
		invitee = cursor.fetchone()
		
		if invitee is None:
			cursor.close()
			return jsonify({'error': 'Invitee not found'}), 404
		
		# Fetch the photo and event folder
		photo_filename = invitee[0]
		cropped_filename = invitee[1]
		event_id = invitee[2]

		# Construct the path to the photo file
		event_folder = os.path.join(app.config['UPLOAD_FOLDER'], event_id)
		photo_path = os.path.join(event_folder, photo_filename)

		cropped_face_folder = os.path.join(event_folder, 'cropped_faces')
		cropped_face_path = os.path.join(cropped_face_folder, cropped_filename)
		
		# Delete the invitee from the database
		cursor.execute('DELETE FROM invitees WHERE invitee_id = %s', (invitee_id,))
		mysql.connection.commit()
		cursor.close()
		
		# Delete the photo from the file system (if it exists)
		if os.path.exists(photo_path):
			os.remove(photo_path)
		if os.path.exists(cropped_face_path):
			os.remove(cropped_face_path)
		
		return jsonify({'message': 'Invitee deleted successfully'}), 200
	
	except Exception as e:
			print(e)
			return jsonify({'error': str(e)}), 500

@app.route('/get-invitees/<event_id>', methods=['GET'])
def get_invitees(event_id):
	try:
		cursor = mysql.connection.cursor()
		query = '''
		SELECT e.event_name, i.invitee_id, i.name, i.phone_number, i.photo, i.timestamps, i.isAttended
		FROM events e
		JOIN invitees i ON e.event_id = i.event_id
		WHERE e.event_id = %s
		'''
		cursor.execute(query, (event_id,))
		results = cursor.fetchall()
		cursor.close()

		if not results:
			return jsonify({'error': 'Event not found or no invitees'}), 404

		event_name = results[0][0]
		invitee_list = []
		for row in results:
			invitee_dict = {
					'invitee_id': row[1],  
					'name': row[2],        
					'phone_number': row[3],
					'photo': row[4],       
					'timestamps': row[5],  
					'isAttended': bool(row[6]) 
			}
			invitee_list.append(invitee_dict)

		# Return the event_name along with the invitees
		return jsonify({
			'event_name': event_name,
			'invitees': invitee_list
		}), 200

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/get-attendees/<event_id>', methods=['GET'])
def get_attendees(event_id):
	try:
		cursor = mysql.connection.cursor()
		query = '''
		SELECT e.event_name, e.event_date, e.start_time, e.end_time, e.threshold, 
			   i.invitee_id, i.name, i.phone_number, i.photo, i.timestamps, i.isAttended, i.isPresent
		FROM events e
		JOIN invitees i ON e.event_id = i.event_id
		WHERE e.event_id = %s AND i.timestamps IS NOT NULL
		'''
		cursor.execute(query, (event_id,))
		results = cursor.fetchall()
		cursor.close()

		if not results:
			# return jsonify({'error': 'Event not found or no attendees'}), 404
			# Return an empty list of attendees for an existing event with no timestamps
			return jsonify({
				'event_name': '',
				'attendees': [],
				'event_date': '',
				'event_end_time': '',
				'event_start_time': ''
			}), 200

		event_name = results[0][0]
		event_date = results[0][1]
		event_start_time = results[0][2]  # Fetch start time from DB (time object)
		event_end_time = results[0][3]    # Fetch end time from DB (time object)
		event_threshold = results[0][4]   # Fetch threshold (in minutes)

		total_seconds = event_end_time.total_seconds()
		hours = int(total_seconds // 3600) % 24
		minutes = int((total_seconds % 3600) // 60) + 30
		seconds = int(total_seconds % 60)

		# Extract year, month, and day from event_date
		year = event_date.year
		month = event_date.month
		day = event_date.day

		# Create a full datetime object using year, month, day from event_date and time from event_end_time
		event_end_datetime = datetime(year=year, month=month, day=day, hour=hours, minute=minutes, second=seconds)

		# Get the current time
		current_time = datetime.now()

		attendee_list = []
		for row in results:
			timestamps = row[9] 
			isAttended = row[10]  

			# Only compute the attendance after the event has ended
			if current_time > event_end_datetime:  # Compare time objects directly
				total_duration = timedelta(0)  # Initialize total duration
				
				if timestamps:
					timestamps = json.loads(timestamps)  # Parse the JSON field (arrivals and departures)

					# Calculate the total time between each arrival and departure
					for arrival_str, departure_str in zip(timestamps['arrivals'], timestamps['departures']):
						arrival = datetime.strptime(arrival_str, '%H:%M:%S').time()
						departure = datetime.strptime(departure_str, '%H:%M:%S').time()

						# Combine time with a dummy date to calculate the duration correctly
						arrival_datetime = datetime.combine(datetime.today(), arrival)
						departure_datetime = datetime.combine(datetime.today(), departure)

						total_duration += (departure_datetime - arrival_datetime)

				# Check if total time exceeds the threshold and update attendance status
				attended = total_duration >= timedelta(minutes=event_threshold)

				if attended and not isAttended:
					cursor = mysql.connection.cursor()
					cursor.execute('UPDATE invitees SET isAttended = TRUE WHERE invitee_id = %s', (row[4],))
					mysql.connection.commit()
					cursor.close()

				# Add the attendee details to the list
				attendee_dict = {
					'invitee_id': row[5],
					'name': row[6],
					'phone_number': row[7],
					'photo': row[8],
					'timestamps': row[9],
					'isAttended': attended  # Send calculated isAttended status to the frontend
				}
			else:
				# Check if the attendee is currently at the event
				if timestamps:
					timestamps = json.loads(timestamps)
					is_currently_present = len(timestamps['arrivals']) > len(timestamps['departures'])
				else:
					is_currently_present = False

				# Add real-time status before the event ends
				attendee_dict = {
					'invitee_id': row[5],
					'name': row[6],
					'phone_number': row[7],
					'photo': row[8],
					'timestamps': row[9],
					'isAttended': None,  # Attendance not computed yet
					'isPresent': is_currently_present  # True if attendee is currently at the event
				}
			attendee_list.append(attendee_dict)

		return jsonify({
			'event_name': event_name,
			'attendees': attendee_list,
			'event_date': event_date.strftime('%Y-%m-%d'),
			'event_end_time': str(event_end_time),
			'event_start_time': str(event_start_time),
		}), 200

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/download-attendance-logs/<event_id>', methods=['GET'])
def download_attendance(event_id):
	try:
		cursor = mysql.connection.cursor()
		query = '''
		SELECT e.event_name, i.invitee_id, i.name, i.phone_number, i.photo, i.timestamps, i.isAttended
		FROM events e
		LEFT JOIN invitees i ON e.event_id = i.event_id
		WHERE e.event_id = %s AND i.timestamps IS NOT NULL
		'''
		cursor.execute(query, (event_id,))
		results = cursor.fetchall()
		cursor.close()

		if not results:
			return jsonify({'error': 'No attendees with timestamps found'}), 404

		# Process the results and prepare them for export
		event_name = results[0][0]
		attendee_list = []

		# Create list of dicts to prepare the data for Excel export
		for row in results:
			attendee_dict = {
				'Invitee ID': row[1],
				'Name': row[2],
				'Phone Number': row[3],
				'Photo': row[4],
				'Timestamps': row[5],
				'Attended': bool(row[6]),
			}
			attendee_list.append(attendee_dict)

		# Convert the list of dicts into a pandas DataFrame
		df = pd.DataFrame(attendee_list)

		# Write the DataFrame to an Excel file in memory (BytesIO)
		output = BytesIO()
		with pd.ExcelWriter(output, engine='openpyxl') as writer:
			df.to_excel(writer, index=False, sheet_name='Attendance')

		# Rewind the buffer
		output.seek(0)

		# Send the Excel file as a downloadable response
		return send_file(output, as_attachment=True, download_name=f"{event_name}_attendance_logs.xlsx", mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500
	

if __name__ == "__main__":
	app.run(debug=True,host="0.0.0.0", port=5000)



# # Scheduler to start and stop tracking based on event timing
# def check_event_timing_and_track(event_id, mysql):
# 	while True:
# 		cursor = mysql.connection.cursor()
# 		cursor.execute('SELECT event_date, start_time, end_time FROM events WHERE event_id = %s', (event_id,))
# 		event = cursor.fetchone()

# 		if not event:
# 			print(f"Event ID {event_id} not found.")
# 			return

# 		event_date = event[0]
# 		event_start_time = event[1]
# 		event_end_time = event[2]

# 		end_total_seconds = event_end_time.total_seconds()
# 		end_hours = int(end_total_seconds // 3600) % 24
# 		end_minutes = int((end_total_seconds % 3600) // 60) + 30
# 		end_seconds = int(end_total_seconds % 60)

# 		start_total_seconds = event_start_time.total_seconds()
# 		start_hours = int(start_total_seconds // 3600) % 24
# 		start_minutes = int((start_total_seconds % 3600) // 60) - 30
# 		start_seconds = int(start_total_seconds % 60)

# 		# Extract year, month, and day from event_date
# 		year = event_date.year
# 		month = event_date.month
# 		day = event_date.day

# 		event_end_datetime = datetime(year=year, month=month, day=day, hour=end_hours, minute=end_minutes, second=end_seconds)
# 		event_start_datetime = datetime(year=year, month=month, day=day, hour=start_hours, minute=start_minutes, second=start_seconds)
		
# 		current_time = datetime.now()

# 		# time_before_start = start_time - timedelta(minutes=30)
# 		# time_after_end = end_time + timedelta(minutes=30)

# 		if event_start_datetime <= current_time <= event_end_datetime:
# 			print("Starting YOLO face tracking.")
# 			run_yolo_face_tracking_webcam(event_id, mysql)

# 		if current_time > event_end_datetime:
# 			print("Event is over. Stopping tracking.")
# 			break

# 		time.sleep(60)  # Check every minute

# # Function to start the tracking thread
# def start_tracking_thread(event_id, mysql):
# 	tracking_thread = threading.Thread(target=check_event_timing_and_track, args=(event_id, mysql))
# 	tracking_thread.start()