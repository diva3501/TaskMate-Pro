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
        console.log('No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err); // Log the error
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

app.get('/notifications/unread-count', verifyToken, (req, res) => {
    connection.query(
        'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
        [req.userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching unread notifications count:', error);
                return res.status(500).json({ error: error.message });
            }
            res.json({ count: results[0].count });
        }
    );
});

app.get('/notifications', verifyToken, (req, res) => {
    connection.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [req.userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        }
    );
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
            return res.status(404).json({ error: 'Task not found or not authorized' });
        }
        const notificationMessage = `Task completed: ${id}`;
        connection.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
            [req.userId, notificationMessage], 
            (err) => {
                if (err) console.error("Error creating notification for completed task:", err);
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

app.get('/collaboration/groups', verifyToken, (req, res) => {
    connection.query(
        `SELECT c.id, c.name 
        FROM collaborations c
        JOIN collaboration_members cm ON cm.collaboration_id = c.id
        WHERE cm.user_id = ?`, [req.userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching task groups:', error);
                return res.status(500).json({ error: 'Error fetching task groups' });
            }
            res.json(results);
        }
    );
});

app.post('/collaboration/groups', verifyToken, (req, res) => {
    console.log(req.body);
    const { name } = req.body;  

    if (!name) { 
        return res.status(400).json({ error: 'Group name is required' });
    }

    connection.query('INSERT INTO collaborations (name, created_by) VALUES (?, ?)', [name, req.userId], (error, result) => {
        if (error) {
            console.error('Error creating task group:', error);
            return res.status(500).json({ error: 'Error creating task group' });
        }
        const groupId = result.insertId;

        connection.query('INSERT INTO collaboration_members (collaboration_id, user_id) VALUES (?, ?)', [groupId, req.userId], (err) => {
            if (err) {
                console.error('Error adding user to collaboration_members:', err);
                return res.status(500).json({ error: 'Error adding user to group' });
            }
            res.status(201).json({ id: groupId, name }); 
        });
    });
});

app.post('/collaboration/groups/:groupId/invite', verifyToken, (req, res) => {
    const { groupId } = req.params;
    const { receiver_username } = req.body;

    if (!receiver_username) {
        return res.status(400).json({ error: 'Receiver username is required' });
    }

    connection.query('SELECT id FROM users WHERE username = ?', [receiver_username], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            return res.status(500).json({ error: 'Error inviting user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const receiverId = results[0].id;

        connection.query('SELECT * FROM collaboration_members WHERE collaboration_id = ? AND user_id = ?', [groupId, receiverId], (err, members) => {
            if (err) {
                console.error('Error checking group membership:', err);
                return res.status(500).json({ error: 'Error checking group membership' });
            }
            if (members.length > 0) {
                return res.status(400).json({ error: 'User is already a member of this group' });
            }

            connection.query('INSERT INTO group_invitations (collaboration_id, sender_id, receiver_id, status) VALUES (?, ?, ?, ?)', [groupId, req.userId, receiverId, 'Pending'], (err) => {
                if (err) {
                    console.error('Error sending invitation:', err);
                    return res.status(500).json({ error: 'Error sending invitation' });
                }
                res.status(201).json({ message: `Invitation sent to ${receiver_username}` });
            });
        });
    });
});


app.put('/collaboration/invitations/:invitationId/accept', verifyToken, (req, res) => {
    const invitationId = req.params.invitationId;

    connection.query('UPDATE group_invitations SET status = "Accepted" WHERE id = ?', [invitationId], (error, results) => {
        if (error) {
            console.error('Error accepting invitation:', error);
            return res.status(500).json({ error: 'Error accepting invitation' });
        }

        connection.query(
            'INSERT INTO collaboration_members (collaboration_id, user_id) SELECT collaboration_id, receiver_id FROM group_invitations WHERE id = ?',
            [invitationId],
            (err) => {
                if (err) {
                    console.error('Error adding user to collaboration_members:', err);
                    return res.status(500).json({ error: 'Error joining the group' });
                }
                res.json({ message: 'Invitation accepted successfully' });
            }
        );
    });
});

app.put('/collaboration/invitations/:invitationId/reject', verifyToken, (req, res) => {
    const invitationId = req.params.invitationId;

    connection.query('UPDATE group_invitations SET status = "Rejected" WHERE id = ?', [invitationId], (error) => {
        if (error) {
            console.error('Error rejecting invitation:', error);
            return res.status(500).json({ error: 'Error rejecting invitation' });
        }
        res.json({ message: 'Invitation rejected successfully' });
    });
});

app.get('/collaboration/invitations', verifyToken, (req, res) => {
    const userId = req.userId; 

    connection.query(
        `SELECT gi.id, c.name AS group_name, gi.status
         FROM group_invitations gi
         JOIN collaborations c ON gi.collaboration_id = c.id
         WHERE gi.receiver_id = ? AND gi.status = 'Pending'`, [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching invitations:', error);
                return res.status(500).json({ error: 'Error fetching invitations' });
            }
            res.json(results);
        }
    );
});


app.get('/collaboration/groups/:groupId/todo', verifyToken, (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.userId;
    connection.query(
        `SELECT * FROM collaboration_members 
         WHERE collaboration_id = ? AND user_id = ?`, [groupId, userId],
        (error, results) => {
            if (error) {
                console.error('Error checking group membership:', error);
                return res.status(500).json({ error: 'Error checking group membership' });
            }
            if (results.length === 0) {
                return res.status(403).json({ error: 'Forbidden: You are not a member of this group' });
            }
            connection.query(
                'SELECT * FROM todo_list WHERE collaboration_id = ?', [groupId],
                (err, todos) => {
                    if (err) {
                        console.error('Error fetching todos:', err);
                        return res.status(500).json({ error: 'Error fetching todos' });
                    }
                    res.json(todos);
                }
            );
        }
    );
});

app.post('/collaboration/groups/:groupId/todo', verifyToken, (req, res) => {
    const groupId = req.params.groupId;
    const { task_name } = req.body;

    connection.query(
        `SELECT * FROM collaboration_members 
         WHERE collaboration_id = ? AND user_id = ?`, [groupId, req.userId],
        (error, results) => {
            if (error) {
                console.error('Error checking group membership:', error);
                return res.status(500).json({ error: 'Error checking group membership' });
            }
            if (results.length === 0) {
                return res.status(403).json({ error: 'Forbidden: You are not a member of this group' });
            }
            connection.query(
                'INSERT INTO todo_list (collaboration_id, task_name, created_at) VALUES (?, ?, NOW())',
                [groupId, task_name],
                (err, result) => {
                    if (err) {
                        console.error('Error adding todo:', err);
                        return res.status(500).json({ error: 'Error adding todo' });
                    }
                    res.status(201).json({ id: result.insertId, task_name });
                }
            );
        }
    );
});
app.delete('/collaboration/groups/:groupId/todo/:todoId', verifyToken, (req, res) => {
    const { groupId, todoId } = req.params;

    connection.query(
        'DELETE FROM todo_list WHERE id = ? AND collaboration_id = ?',
        [todoId, groupId],
        (error, result) => {
            if (error) {
                console.error("Error deleting todo:", error);
                return res.status(500).json({ error: 'Failed to delete the To-Do item' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'To-Do item not found' });
            }
            res.json({ message: 'To-Do item deleted successfully!' });
        }
    );
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
