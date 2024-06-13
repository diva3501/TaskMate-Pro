from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS settings to allow all origins

def connect_to_database():
    try:
        conn = psycopg2.connect(
            dbname="taskmanager",
            user="user",
            password="user1234",
            host="localhost",
            port="5432"
        )
        print("Connected to the database successfully!")
        return conn
    except psycopg2.Error as e:
        print("Unable to connect to the database.")
        print(e)
        return None

conn = connect_to_database()

@app.route('/register', methods=['POST'])
def register():
    new_user = request.json
    username = new_user['username']
    password = new_user['password']
    hashed_password = generate_password_hash(password)

    with conn.cursor() as cursor:
        try:
            cursor.execute(
                "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id, username;",
                (username, hashed_password)
            )
            conn.commit()
            user = cursor.fetchone()
            return jsonify({"id": user[0], "username": user[1]}), 201
        except psycopg2.Error as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    login_details = request.json
    username = login_details['username']
    password = login_details['password']

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            "SELECT id, username, password FROM users WHERE username = %s;",
            (username,)
        )
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            return jsonify({"id": user['id'], "username": user['username']}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401


@app.route('/tasks', methods=['GET'])
def get_tasks():
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM tasks;")
        tasks = cursor.fetchall()
        return jsonify(tasks)

@app.route('/tasks/statistics', methods=['GET'])
def get_task_statistics():
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'Completed') AS overdue
            FROM tasks;
        """)
        stats = cursor.fetchone()
        return jsonify(stats)

@app.route('/tasks', methods=['POST'])
def create_task():
    new_task = request.json
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO tasks (title, description) VALUES (%s, %s) RETURNING *;",
            (new_task['title'], new_task['description'])
        )
        conn.commit()
        task = cursor.fetchone()
        return jsonify(task), 201

@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    updated_task = request.json
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE tasks SET title = %s, description = %s WHERE id = %s RETURNING *;",
            (updated_task['title'], updated_task['description'], id)
        )
        conn.commit()
        task = cursor.fetchone()
        return jsonify(task)

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM tasks WHERE id = %s;", (id,))
        conn.commit()
        return '', 204

@app.route('/tasks/overdue', methods=['GET'])
def get_overdue_tasks():
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM tasks WHERE due_date < NOW() AND status != 'Completed';")
        overdue_tasks = cursor.fetchall()
        return jsonify(overdue_tasks)

if __name__ == '__main__':
    app.run(debug=True)
