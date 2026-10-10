# AttendEase — Student Attendance Management Frontend

A responsive browser-based frontend prototype for the Student Attendance Management System project.

## Features
- Demo administrator login
- Dashboard summary and today's attendance overview
- Add, edit, search, and delete student records
- Mark attendance by student, subject, date, and Present/Absent status
- Duplicate student/date/subject entries update the previous status
- Subject-wise attendance reports and CSV export
- Responsive layout for desktop and mobile
- Demo data stored in browser `localStorage`

## Run it
1. Extract `student_attendance_frontend.zip`.
2. Open the extracted `student_attendance_frontend` folder.
3. Double-click `index.html` to open it in Chrome, or open the folder in VS Code and use the Live Server extension.
4. Sign in with:
   - Username: `admin`
   - Password: `admin123`

## Important: frontend vs. your Java/MySQL project
This is a **frontend prototype**. It currently saves demo records in the browser's local storage. It does not yet call your existing Java Swing application or MySQL database.

Your uploaded Java application uses Swing/JDBC directly. To make this website read and write the same MySQL data, add a web backend (for example, Java Spring Boot REST endpoints) and change the JavaScript functions to call those endpoints. Do not connect browser JavaScript directly to MySQL or expose database credentials in frontend files.

## Suggested API contract for later integration
- `POST /api/auth/login`
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`
- `GET /api/attendance?date=YYYY-MM-DD`
- `POST /api/attendance`
- `GET /api/reports`

The API endpoints above are a suggested contract only; they are not implemented in this static frontend.
