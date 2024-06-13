import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:5000/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const sortedTasks = tasks.sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (a.priority !== 'High' && b.priority === 'High') return 1;
    if (a.priority === 'Medium' && b.priority !== 'Medium') return -1;
    if (a.priority !== 'Medium' && b.priority === 'Medium') return 1;
    return 0;
  });

  return (
    <div>
      <div className="navbar">
        <nav className="stroke">
          <ul>
            <li><Link to="/homepage">Home</Link></li>
            <li><Link to="/tasklist">Tasklist</Link></li>
            <li><Link to="/create">Create Task</Link></li>
            <li><Link to="/overdue">Overdue Tasks</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
      </div>
      <br></br><br></br><br></br><br></br><br></br>
      <br></br>
      
      <Link to="/create" className="create-task-button">Create New Task</Link>
      <br></br>
      <ul className="task-list">
        {sortedTasks.map((task, index) => (
          <li key={task.id} className="task-item">
            <span className="task-number">Task {index + 1}:</span>
            <div className="task-details">
              <h2>{task.title}</h2>
              <p>{task.description}</p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
            </div>
            <div className="button-group">
              <Link to={`/edit/${task.id}`} className="edit-button">Edit</Link>
              <button className="delete-button" onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
