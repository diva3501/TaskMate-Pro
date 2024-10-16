import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OverdueTasks.css';
import Navbar from './Navbar';

const OverdueTasks = () => {
  const [overdueTasks, setOverdueTasks] = useState([]);

  useEffect(() => {
    const fetchOverdueTasks = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:5000/tasks/overdue', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setOverdueTasks(response.data);
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
      }
    };

    fetchOverdueTasks();
  }, []);

  return (
    <div className="overdue-tasks-page">
      <Navbar/>
      <div className="overdue-tasks-content">
        <h1>Overdue Tasks</h1>
        <ul className="overdue-tasks-list">
          {overdueTasks.length > 0 ? (
            overdueTasks.map(task => (
              <li key={task.id} className="overdue-task-item">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Due Date: {new Date(task.due_date).toLocaleString()}</p>
              </li>
            ))
          ) : (
            <li>No overdue tasks found.</li> 
          )}
        </ul>
      </div>
    </div>
  );
};

export default OverdueTasks;
