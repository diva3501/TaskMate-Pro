const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'taskmanager',
    password: 'user1234',
    database: 'taskmanager',
});

connection.connect((err) => {
    if (err) {
        console.error('Unable to connect to the database:', err);
        return;
    }
    console.log('Connected to the database successfully!');
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (error, results) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(201).json({ id: results.insertId, username });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT id, username, password FROM users WHERE username = ?', [username], (error, results) => {
        if (error || results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
            return res.status(200).json({ token });
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

app.get('/tasks', verifyToken, (req, res) => {
    connection.query('SELECT * FROM tasks WHERE user_id = ?', [req.userId], (error, results) => {
        if (error) {
            console.error("SQL error in /tasks:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

// Get notifications for a user
app.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the authenticated token
        
        // Query to fetch notifications
        const notifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(notifications.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete('/notifications', verifyToken, (req, res) => {
    connection.query('DELETE FROM notifications WHERE user_id = ?', [req.userId], (error, results) => {
        if (error) {
            console.error("SQL error in /notifications/clear:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'Notifications cleared successfully' });
    });
});

app.post('/tasks', verifyToken, (req, res) => {
    const { title, description, due_date, category, priority, status } = req.body;

    connection.query(
        'INSERT INTO tasks (title, description, due_date, category, priority, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [title, description, due_date, category, priority, status, req.userId], 
        (error, results) => {
            if (error) {
                return res.status(400).json({ error: error.message });
            }
            connection.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
                [req.userId, `New task created: ${title}`], 
                (err) => {
                    if (err) console.error("Error creating notification:", err);
                }
            );
            res.status(201).json({ id: results.insertId, title, description, due_date, category, priority, status });
        }
    );
});

app.put('/tasks/edit/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { due_date, status } = req.body;

    const getTaskTitleQuery = 'SELECT title FROM tasks WHERE id = ? AND user_id = ?';
    connection.query(getTaskTitleQuery, [id, req.userId], (err, taskResult) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error fetching task details' });
        }
        if (taskResult.length === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized' });
        }

        const taskTitle = taskResult[0].title;

        const updateTaskQuery = 'UPDATE tasks SET due_date = ?, status = ? WHERE id = ? AND user_id = ?';
        connection.query(updateTaskQuery, [due_date, status, id, req.userId], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Error updating task' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found or not authorized' });
            }

            const insertNotificationQuery = 'INSERT INTO notifications (user_id, message) VALUES (?, ?)';
            connection.query(insertNotificationQuery, [req.userId, `Task edited: ${taskTitle}`], (error) => {
                if (error) console.error('Error creating notification:', error);
            });

            res.json({ message: 'Task updated successfully' });
        });
    });
});


app.delete('/tasks/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    connection.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId], (error, results) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized to delete this task' });
        }
        connection.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
            [req.userId, `Task deleted: ${id}`], 
            (err) => {
                if (err) console.error("Error creating notification:", err);
            }
        );
        res.status(204).send();
    });
});

app.get('/tasks/overdue', verifyToken, (req, res) => {
    connection.query(
        "SELECT * FROM tasks WHERE due_date < NOW() AND status != 'Completed' AND user_id = ?",
        [req.userId],
        (error, results) => {
            if (error) {
                console.error("Error fetching overdue tasks:", error);
                return res.status(500).json({ error: error.message });
            }

            if (results.length > 0) {
                console.log("Overdue tasks found:", results); 

                results.forEach(task => {
                    const message = `Overdue task: ${task.title}`;
                    connection.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
                        [req.userId, message], 
                        (err) => {
                            if (err) {
                                console.error("Error creating notification for overdue task:", err);
                            } else {
                                console.log("Notification created for overdue task:", message);
                            }
                        }
                    );
                });
            } else {
                console.log("No overdue tasks found."); 
            }

            res.json(results);
        }
    );
});

app.put('/tasks/complete/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    connection.query('UPDATE tasks SET status = "Completed" WHERE id = ? AND user_id = ?', [id, req.userId], (error, results) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized to complete this task' });
        }
        connection.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
            [req.userId, `Congratulations! Task completed: ${id}`], 
            (err) => {
                if (err) console.error("Error creating notification:", err);
            }
        );
        res.json({ message: 'Task marked as completed' });
    });
});

app.get('/tasks/statistics', verifyToken, (req, res) => {
    connection.query(
        'SELECT ' +
        '(SELECT COUNT(*) FROM tasks WHERE status = "Completed" AND user_id = ?) AS completed, ' +
        '(SELECT COUNT(*) FROM tasks WHERE status = "Pending" AND user_id = ?) AS pending, ' +
        '(SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != "Completed" AND user_id = ?) AS overdue',
        [req.userId, req.userId, req.userId],
        (error, results) => {
            if (error) {
                console.error("SQL error in /tasks/statistics:", error);
                return res.status(500).json({ error: error.message });
            }
            res.json(results[0]);
        }
    );
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
