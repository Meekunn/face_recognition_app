CREATE DATABASE IF NOT EXISTS attendit_db;

USE attendit_db;

CREATE TABLE organisations (
    id CHAR(12) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    organisation_id VARCHAR(255) NOT NULL,
    threshold INT NOT NULL DEFAULT 30,
    FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE
);

CREATE TABLE invitees (
    invitee_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    cropped_photo VARCHAR(255) NOT NULL,
    timestamps JSON CHECK (JSON_VALID(timestamps)),
    isAttended BOOLEAN DEFAULT FALSE,
    isPresent BOOLEAN DEFAULT FALSE,
    event_id VARCHAR(255),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);


-- To import mysqldump run `mysql -u username -p attendit_backup < attendit_backup.sql`