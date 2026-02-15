-- Create databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE employee_db;
CREATE DATABASE attendance_db;
CREATE DATABASE leave_db;
CREATE DATABASE payroll_db;
CREATE DATABASE notification_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE employee_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE leave_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE payroll_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO hris;

-- Connect to each database and grant schema privileges
\c auth_db
GRANT ALL ON SCHEMA public TO hris;

\c employee_db
GRANT ALL ON SCHEMA public TO hris;

\c attendance_db
GRANT ALL ON SCHEMA public TO hris;

\c leave_db
GRANT ALL ON SCHEMA public TO hris;

\c payroll_db
GRANT ALL ON SCHEMA public TO hris;

\c notification_db
GRANT ALL ON SCHEMA public TO hris;