# PersonalTaskManager

PersonalTaskManager is a task management application built with Node.js, Express, MySQL, and JWT authentication. It provides users with task management, collaboration features, and notifications to keep track of their tasks and deadlines efficiently.

## Features

- **User Authentication**: Secure registration and login with password hashing and JWT token-based authentication.
- **Task Management**: Create, edit, delete, and view tasks with attributes like due date, priority, status, and category.
- **Notifications**: Track changes and updates through real-time notifications for task additions, updates, and overdue tasks.
- **Collaboration**: Create and manage task groups with other users. Invite friends to join groups, accept/reject invitations, and collaborate on shared tasks.
- **Statistics**: View a summary of completed, pending, and overdue tasks.
  
## Prerequisites

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [MySQL](https://www.mysql.com/) database

## Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd PersonalTaskManager
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Setup environment variables:**
    Create a `.env` file in the project root directory and add the following:

    ```plaintext
    SECRET_KEY=<your_jwt_secret>
    ```

4. **Database Configuration:**
   Ensure that a MySQL database named `taskmanager` is created. Set up the user credentials as configured in your code:

    ```plaintext
    MySQL user: username
    MySQL password: userpassword
    ```

5. **Run Database Migrations:**
   Import the necessary tables as per your project schema.

## Running the Application

1. **Start the server:**
    ```bash
    node app.js
    ```

2. The server will start on `http://localhost:3000`.

## API Endpoints

### Authentication
- **POST** `/register` - Register a new user.
- **POST** `/login` - Login a user and receive a JWT token.

### Tasks
- **GET** `/tasks` - Get all tasks for the logged-in user.
- **POST** `/tasks` - Create a new task.
- **PUT** `/tasks/edit/:id` - Edit an existing task.
- **DELETE** `/tasks/:id` - Delete a task.
- **GET** `/tasks/overdue` - Get overdue tasks.
- **PUT** `/tasks/complete/:id` - Mark a task as completed.
- **GET** `/tasks/statistics` - Get task completion statistics.

### Notifications
- **GET** `/notifications/unread-count` - Get count of unread notifications.
- **GET** `/notifications` - Get all notifications.
- **DELETE** `/notifications` - Clear all notifications.

### Collaboration
- **GET** `/collaboration/groups` - Get all collaboration groups the user is part of.
- **POST** `/collaboration/groups` - Create a new collaboration group.
- **POST** `/collaboration/groups/:groupId/invite` - Invite a user to a collaboration group.

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT, bcrypt
- **Other Libraries**: dotenv, cors, body-parser


## Author

Divakar G
