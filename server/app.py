from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_mysqldb import MySQL
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import uuid
import string
import random
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'pass@word'
app.config['MYSQL_DB'] = 'attendance_app'

mysql = MySQL(app)

# Configuring the upload folder
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['UPLOAD_FOLDER_URL'] = 'http://localhost:8080/uploads'  # Update with your domain and port

if not os.path.exists(app.config['UPLOAD_FOLDER']):
	os.makedirs(app.config['UPLOAD_FOLDER'])

def generate_unique_id(length=12):
	characters = string.ascii_letters + string.digits
	return ''.join(random.choice(characters) for _ in range(length))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
	return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/signup', methods=['POST'])
def signup():
	try:
		data = request.json
		name = data['name']
		email = data['email']
		password = data['password']

		cursor = mysql.connection.cursor()

		# Check if email already exists
		cursor.execute('SELECT * FROM Organisations WHERE email = %s', (email,))
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
			INSERT INTO Organisations (id, name, email, password)
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
		cursor.execute('SELECT * FROM Organisations WHERE email = %s', (email,))
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
		cursor.execute('SELECT * FROM Organisations WHERE id = %s', (organisation_id,))
		organisation = cursor.fetchone()
		if not organisation:
			cursor.close()
			return jsonify({'error': 'Invalid organisation ID'}), 404

		event_id = generate_unique_id()

		cursor.execute('''
			INSERT INTO Events (event_id, event_name, event_date, start_time, end_time, location, organisation_id)
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
		cursor.execute('SELECT * FROM Events WHERE organisation_id = %s', (organisation_id,))
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
		data = request.json
		event_id = data['event_id']
		
		cursor = mysql.connection.cursor()
		
		# Get all invitee_ids associated with the event
		cursor.execute('SELECT invitee_id FROM EventInvitees WHERE event_id = %s', (event_id,))
		invitees = cursor.fetchall()
		
		# Delete associated records from EventInvitees
		cursor.execute('DELETE FROM EventInvitees WHERE event_id = %s', (event_id,))
		
		# Delete invitees who are only linked to this event
		for invitee in invitees:
				invitee_id = invitee[0]
				cursor.execute('SELECT COUNT(*) FROM EventInvitees WHERE invitee_id = %s', (invitee_id,))
				count = cursor.fetchone()[0]
				if count == 0:
						cursor.execute('DELETE FROM Invitees WHERE invitee_id = %s', (invitee_id,))
		
		# Delete the event
		cursor.execute('DELETE FROM Events WHERE event_id = %s', (event_id,))
		
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
		name = request.form['name']
		phone_number = request.form['phone_number']
		invitee_id = request.form['invitee_id']
		
		# Handle file upload
		photo = request.files.get('photo', None)
		if photo is None:
			return jsonify({'error': 'No photo file part'}), 400
		
		filename = secure_filename(photo.filename)
		unique_filename = str(uuid.uuid4()) + "_" + filename
		photo_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
		photo.save(photo_path)

		# Construct the URL to the uploaded image
		photo_url = f"{app.config['UPLOAD_FOLDER']}/{unique_filename}"
		
		# Insert into the database
		cursor = mysql.connection.cursor()
		cursor.execute('''
			INSERT INTO Invitees (invitee_id, name, phone_number, photo)
			VALUES (%s, %s, %s, %s)
		''', (invitee_id, name, phone_number, unique_filename))
		mysql.connection.commit()
		cursor.close()
		print(unique_filename)
		
		return jsonify({'message': 'Invitee added successfully'}), 201

	except Exception as e:
			print(e)
			return jsonify({'error': str(e)}), 500

@app.route('/delete-invitee', methods=['DELETE'])
def delete_invitee():
	try:
		# Get the invitee_id from the request data
		data = request.json
		invitee_id = data['invitee_id']
		
		# Check if the invitee exists
		cursor = mysql.connection.cursor()
		cursor.execute('SELECT * FROM Invitees WHERE invitee_id = %s', (invitee_id,))
		invitee = cursor.fetchone()
		
		if invitee is None:
			cursor.close()
			return jsonify({'error': 'Invitee not found'}), 404
		
		# Delete the invitee
		cursor.execute('DELETE FROM Invitees WHERE invitee_id = %s', (invitee_id,))
		mysql.connection.commit()
		cursor.close()
		
		return jsonify({'message': 'Invitee deleted successfully'}), 200
	
	except Exception as e:
			print(e)
			return jsonify({'error': str(e)}), 500

@app.route('/add-event-invitees', methods=['POST'])
def add_event_invitees():
	try:
		data = request.json
		event_id = data['event_id']
		invitees = data['invitees']  # This should be a list of invitee_ids
		
		cursor = mysql.connection.cursor()

		# Check if event exists
		cursor.execute('SELECT event_id FROM Events WHERE event_id = %s', (event_id,))
		event = cursor.fetchone()
		if not event:
			return jsonify({'error': 'Event does not exist'}), 404

		# Validate invitees
		valid_invitees = []
		for invitee_id in invitees:
			cursor.execute('SELECT invitee_id FROM Invitees WHERE invitee_id = %s', (invitee_id,))
			invitee = cursor.fetchone()
			if invitee:
				valid_invitees.append(invitee_id)
			else:
				return jsonify({'error': f'Invitee with ID {invitee_id} does not exist'}), 404

		if not valid_invitees:
			return jsonify({'error': 'No valid invitees found'}), 404

		# Insert each valid invitee into the EventInvitees table
		for invitee_id in valid_invitees:
			cursor.execute('''
				INSERT INTO EventInvitees (invitee_id, event_id)
				VALUES (%s, %s)
			''', (invitee_id, event_id))
		
		mysql.connection.commit()
		cursor.close()
		
		return jsonify({'message': 'Invitees added to event successfully'}), 201
	
	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/delete-event-invitee', methods=['DELETE'])
def delete_event_invitee():
	try:
		data = request.json
		invitee_id = data['invitee_id']
		
		cursor = mysql.connection.cursor()

		# Delete from EventInvitees first
		cursor.execute('DELETE FROM EventInvitees WHERE invitee_id = %s', (invitee_id,))
		
		# Delete from Invitees
		cursor.execute('DELETE FROM Invitees WHERE invitee_id = %s', (invitee_id,))
		
		mysql.connection.commit()
		cursor.close()
		
		return jsonify({'message': 'Invitee deleted successfully'}), 200
	
	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500


@app.route('/get-event-invitees/<event_id>', methods=['GET'])
def get_event_invitees(event_id):
	try:
		cursor = mysql.connection.cursor()
		cursor.execute('''
			SELECT e.event_name, i.invitee_id, i.name, i.phone_number, i.photo
			FROM Invitees i
			JOIN EventInvitees ea ON i.invitee_id = ea.invitee_id
			JOIN Events e ON ea.event_id = e.event_id
			WHERE ea.event_id = %s
		''', (event_id,))
		result = cursor.fetchall()
		cursor.close()

		# Extract the event name and transform the invitees into a list of dictionaries
		if result:
			event_name = result[0][0]
			invitee_list = []
			for row in result:
				invitee_dict = {
					'invitee_id': row[1],
					'name': row[2],
					'phone_number': row[3],
					'photo': row[4]
				}
				invitee_list.append(invitee_dict)

			return jsonify({'event_name': event_name, 'invitees': invitee_list}), 200
		else:
			return jsonify({'error': 'No invitees found for the given event_id'}), 404
	
	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/get-event-attendees/<event_id>', methods=['GET'])
def get_event_attendees(event_id):
	try:
		cursor = mysql.connection.cursor()
		cursor.execute('''
			SELECT a.attendee_id, a.name, a.photo, a.phone_number, e.event_name
			FROM Attendees a
			JOIN Events e ON a.event_id = e.event_id
			WHERE a.event_id = %s
		''', (event_id,))
		result = cursor.fetchall()
		cursor.close()

		# Extract the event name and transform the attendees into a list of dictionaries
		if result:
			event_name = result[0][4]
			attendee_list = []
			for row in result:
				attendee_dict = {
					'attendee_id': row[0],
					'name': row[1],
					'photo': row[2],
					'phone_number': row[3]
				}
				attendee_list.append(attendee_dict)

			return jsonify({'event_name': event_name, 'attendees': attendee_list}), 200
		else:
			return jsonify({'error': 'No attendees found for the given event_id'}), 404

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

@app.route('/get-attendance-logs/<attendee_id>', methods=['GET'])
def get_attendance_logs(attendee_id):
	try:
		cursor = mysql.connection.cursor()
		cursor.execute('''
			SELECT l.log_id, l.event_id, e.event_name, l.timestamp, l.action
			FROM Attendance_Logs l
			JOIN Events e ON l.event_id = e.event_id
			WHERE l.attendee_id = %s
			ORDER BY l.timestamp
		''', (attendee_id,))
		result = cursor.fetchall()
		cursor.close()

		# Transform the logs into a list of dictionaries for easy JSON serialization
		log_list = []
		for row in result:
			log_dict = {
				'log_id': row[0],
				'event_id': row[1],
				'event_name': row[2],
				'timestamp': str(row[3]),
				'action': row[4]
			}
			log_list.append(log_dict)

		return jsonify(log_list), 200

	except Exception as e:
		print(e)
		return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
	app.run(debug=True, port=8080)
