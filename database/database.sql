CREATE TABLE accounts (accountID INTEGER PRIMARY KEY NOT NULL, login TEXT NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, lname TEXT NOT NULL, email TEXT NOT NULL, privilege INT NOT NULL DEFAULT(1));
CREATE TABLE patients (patientID INTEGER PRIMARY KEY NOT NULL, patientLogin TEXT, patientPassword TEXT, patientName TEXT NOT NULL, patientLName TEXT NOT NULL, patientEmail TEXT, patientContact TEXT NOT NULL. patientAddress TEXT NOT NULL);
CREATE TABLE appointments (appointmentID INTEGER PRIMARY KEY NOT NULL, patientID INTEGER NOT NULL, appointmentDate DATE NOT NULL, appointmentTime TIME NOT NULL, appointmentStatus TEXT NOT NULL);
CREATE TABLE commonPasswords (passwordID INTEGER PRIMARY KEY NOT NULL, password TEXT NOT NULL);
