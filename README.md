# Real-Time Attendance System Using Facial Recognition
## Project Description
This project addresses the inefficiencies of traditional attendance systems by leveraging facial recognition technology to achieve a precise, secure, and non-invasive attendance tracking solution. Using a React and Flask-based web application, the system integrates a MySQL database and deep learning models, including a custom-trained YOLOv10-N model for face detection. Key features include:
- Face Detection using custom-trained YOLOv10-N model
- CNN-based facial feature extraction (DeepFace Framework with Facenet512).
- Cosine similarity for feature matching and attendee identification.
- Event management, attendance tracking, and secure data export functionalities.

The system achieved high accuracy during testing, with a mean Average Precision (mAP50) of 0.95 and a near-perfect recall rate, demonstrating reliability and adaptability in real-world applications.
<br />
Link to Thesis: [[OrofinAdedamola_Thesis](https://drive.google.com/file/d/1q1jNLJQbtsI5i14mQnLB9vSS6EPPqWCX/view?usp=sharing)]

## Steps to Clone the Repository
1. Clone the repository:
   ```
   git clone https://github.com/Meekunn/face_recognition_app.git
   cd face_recognition_app
   ```
2. Navigate to the appropriate folders:
- Frontend (Client): ```cd client```
- Backend (Server): ```cd server```
- Database setup: ```cd db```

## Client Setup (React, TypeScript, Vite)
1. Navigate to the client directory:
  ```cd client```
2. Install dependencies:
  ```npm install```
3. Start the development server:
   ```npm run dev```

## Server Setup (Flask)
### By Creating New Environment
1. Install Anaconda if not already installed.
2. Create a new environment:
  ```conda create --name face_recognition_env```
3. Activate the environment:
  ```conda activate face_recognition_env```
4. Navigate to the server directory:
  ```cd server```
5. Install dependencies:
  ```pip install -r requirements.txt```
6. Start the server:
  ```python app.py```

### By Using environment.yml
1. Install Anaconda if not already installed.
2. Navigate to the server directory:
  ```cd server```
3. Create a Conda environment using environment.yml:
  ```conda env create -f environment.yml```
4. Activate the newly created environment:
  ```conda activate yolo_training```
5. Verify dependencies are installed:
  ```conda list```
6. Start the server:
  ```python app.py```

## Databse Setup
1. Start MySQL Server:
 - Ensure that the MySQL server is running on your system.
2. Access MySQL CLI: Open a terminal and log into MySQL:
  ```mysql -u root -p```
  - Enter your password (default user is root).
3. Create the Database: Execute the following commands to create the database:
  ```
    CREATE DATABASE attendit_db;
    USE attendit_db;
  ```
4. Run the init.sql Script:
  - If the init.sql file is located in the db folder, execute it:
  ```
    mysql -u root -p attendit_db < path/to/init.sql
  ```
  - Replace path/to/init.sql with the actual path to the init.sql file.
5. Import the MySQL Dump File (if needed):
  - If you wish to restore data:
  ```
    mysql -u root -p attendit_db < path/to/dump.sql
  ```
  - Replace path/to/dump.sql with the actual path to the dump file.
6. Verify the Database Setup:
  - Log into MySQL again and confirm the tables:
  ```
    SHOW TABLES;
  ```

## A video showcasing the app's functionality
- [[Real-Time Attendance System Demo 1](https://drive.google.com/file/d/1LulNQiQVTGiizDLZgAXmWkOPx2I7E9qr/view?usp=drive_link)]
- [[Real-Time Attendance System Demo 2](https://drive.google.com/file/d/1DxOhRfiHwAIwqZCBfDmNYz9lTVyZmGRV/view?usp=drive_link)]

