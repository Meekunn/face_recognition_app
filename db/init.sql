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
    timestamps JSON CHECK (JSON_VALID(timestamps)),
    isAttended BOOLEAN DEFAULT FALSE,
    event_id VARCHAR(255),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- INSERT INTO invitees (invitee_id, name, phone_number, photo, timestamps, isAttended, event_id)
-- VALUES (
--     'hW5lw9mTJz',
--     'Test Student',
--     '09089478390',
--     '6ad4e665-dd7e-4487-a0a5-b9064ee2b870_ai_face.png',
--     '{"arrivals": ["2:15:00", "2:35:00", "3:00:00"], "departures": ["2:30:00", "2:50:00", "3:30:00"]}',
--     1,
--     'O2hlzqv9225q'
-- );

-- INSERT INTO invitees (invitee_id, name, phone_number, photo, timestamps, isAttended, event_id)
-- VALUES (
--     'ty1tC4KYRC',
--     'Test Again',
--     '09088500394',
--     '11dea9ef-c913-4f68-9a87-d209b8b28de5_my_selfie.png',
--     '{"arrivals": ["2:30:00", "3:00:00"], "departures": ["2:45:00", "3:30:00"]}',
--     1,
--     'O2hlzqv9225q'
-- );

-- INSERT INTO invitees (invitee_id, name, phone_number, photo, timestamps, isAttended, event_id)
-- VALUES (
--     'ty9e64KYMn',
--     'Test Again',
--     '09088500394',
--     '11dea9ef-c913-4f68-9a87-d209b8b28de5_my_selfie.png',
--     '{"arrivals": ["2:30:00", "3:00:00"], "departures": ["2:45:00", "3:05:00"]}',
--     1,
--     'O2hlzqv9225q'
-- );