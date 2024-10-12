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
        }
         else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

app.get('/tasks', verifyToken, (req, res) => {
    connection.query('SELECT * FROM tasks WHERE user_id = ?', [req.userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});

app.post('/tasks', verifyToken, (req, res) => {
    const { title, description, due_date, priority, status } = req.body;

    connection.query(
        'INSERT INTO tasks (title, description, due_date, priority, status, user_id) VALUES (?, ?, ?, ?, ?, ?)', 
        [title, description, due_date, priority, status, req.userId], 
        (error, results) => {
            if (error) {
                return res.status(400).json({ error: error.message });
            }
            res.status(201).json({ id: results.insertId, title, description, due_date, priority, status });
        }
    );
});

app.put('/tasks/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { title, description, due_date, priority, status } = req.body;

    connection.query('UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ? WHERE id = ? AND user_id = ?', 
        [title, description, due_date, priority, status, id, req.userId], 
        (error, results) => {
            if (error) {
                return res.status(400).json({ error: error.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found or not authorized to update this task' });
            }
            res.json({ id, title, description, due_date, priority, status });
        }
    );
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
        res.status(204).send();
    });
});

app.get('/tasks/overdue', verifyToken, (req, res) => {
    connection.query(
        "SELECT * FROM tasks WHERE due_date < NOW() AND status != 'Completed' AND user_id = ?",
        [req.userId],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        }
    );
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
