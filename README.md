# Task Manager Web Application

This is a web application for managing tasks and user accounts. It provides functionality for users to register, log in, create, update, delete tasks, and view task statistics.

## Technologies Used

- **Frontend**: React.js, Axios for HTTP requests, React Router for navigation
- **Backend**: Python Flask, PostgreSQL database
- **Database**: PostgreSQL
- **Security**: Password hashing using Werkzeug's `generate_password_hash` and `check_password_hash`
- **Other Libraries**: psycopg2 for PostgreSQL database connectivity, flask_cors for enabling CORS

## Features

- **User Authentication**:
  - Register: Allows new users to create an account with a unique username and password.
  - Login: Existing users can securely log in using their credentials.

- **Task Management**:
  - Create Task: Users can add new tasks with a title and description.
  - Update Task: Edit existing tasks by modifying their title and description.
  - Delete Task: Remove tasks from the database.
  - View Tasks: Display all tasks stored in the database.
  - Task Statistics: Retrieve statistics such as the number of completed, pending, and overdue tasks.

## Folder Structure

- **`frontend/`**: Contains the React frontend code.
- **`backend/`**: Holds the Python Flask backend code.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/diva3501/PersonalTaskManager.git
   cd task-manager
   ```

2. **Backend Setup**:
   - Navigate to the `backend/` directory.
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Modify database connection details in `app.py` if necessary.
   - Run the Flask server:
     ```bash
     python app.py
     ```

3. **Frontend Setup**:
   - Navigate to the `frontend/` directory.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   - Open your browser and go to `http://localhost:3000` to view the frontend.
   - Ensure the Flask server is running on `http://localhost:5000` for backend API calls.

## API Endpoints

- **`POST /register`**: Register a new user with username and password.
- **`POST /login`**: Log in with username and password to obtain an access token.
- **`GET /tasks`**: Retrieve all tasks.
- **`GET /tasks/statistics`**: Retrieve task statistics (completed, pending, overdue).
- **`POST /tasks`**: Create a new task.
- **`PUT /tasks/<id>`**: Update an existing task by ID.
- **`DELETE /tasks/<id>`**: Delete a task by ID.
- **`GET /tasks/overdue`**: Retrieve overdue tasks.

## Troubleshooting

- Ensure PostgreSQL is installed and running.
- Verify database connection details in `app.py`.
- Check CORS configuration in Flask (`CORS(app)` in `app.py`).
- Inspect browser console for frontend errors.

