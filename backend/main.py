from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/tasks/*": {"origins": "*"}})  

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

@app.route('/tasks', methods=['GET'])
def get_tasks():
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM tasks;")
        tasks = cursor.fetchall()
        return jsonify(tasks)

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

if __name__ == '__main__':
    app.run(debug=True)
