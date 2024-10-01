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

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


app.config['MYSQL_HOST'] = 'db'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'pass@word'
app.config['MYSQL_DB'] = 'attendit_db'

mysql = MySQL(app)

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
			if not os.path.exists(event_folder):
					os.makedirs(event_folder)
			
			# Handle file upload for the invitee
			photo = request.files.get('photo', None)  # Expecting a file input named 'photo'
			if photo is None:
					return jsonify({'error': 'No photo file part for invitee'}), 400

			filename = secure_filename(photo.filename)
			unique_filename = str(uuid.uuid4()) + "_" + filename
			photo_path = os.path.join(event_folder, unique_filename)  # Save to event folder
			photo.save(photo_path)

			# Insert invitee data into the database
			cursor.execute('''
				INSERT INTO invitees (invitee_id, name, phone_number, photo, event_id)
				VALUES (%s, %s, %s, %s, %s)
				''', (
					invitee_id, name, phone_number, unique_filename, event_id
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
		cursor.execute('SELECT photo, event_id FROM invitees WHERE invitee_id = %s', (invitee_id,))
		invitee = cursor.fetchone()
		
		if invitee is None:
			cursor.close()
			return jsonify({'error': 'Invitee not found'}), 404
		
		# Fetch the photo and event folder
		photo_filename = invitee[0]
		event_id = invitee[1]

		# Construct the path to the photo file
		event_folder = os.path.join(app.config['UPLOAD_FOLDER'], event_id)
		photo_path = os.path.join(event_folder, photo_filename)
		
		# Delete the invitee from the database
		cursor.execute('DELETE FROM invitees WHERE invitee_id = %s', (invitee_id,))
		mysql.connection.commit()
		cursor.close()
		
		# Delete the photo from the file system (if it exists)
		if os.path.exists(photo_path):
			os.remove(photo_path)
		
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
		SELECT e.event_name,e.event_date, e.start_time, e.end_time, e.threshold, i.invitee_id, i.name, i.phone_number, i.photo, i.timestamps, i.isAttended
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
		minutes = int((total_seconds % 3600) // 60)
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
				attendee_dict = {
					'invitee_id': row[5],
					'name': row[6],
					'phone_number': row[7],
					'photo': row[8],
					'timestamps': row[9],
					'isAttended': None  # Indicates that attendance hasn't been computed yet
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
