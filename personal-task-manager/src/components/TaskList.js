import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TaskList.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [newStatus, setNewStatus] = useState('Pending');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      const response = await axios.get('http://localhost:3000/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again later.');
    }
  };

  const openEditPopup = (task) => {
    setSelectedTask(task);
    setNewDueDate(new Date(task.due_date));
    setNewStatus(task.status);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (selectedTask) {
      try {
        const token = localStorage.getItem('token');
        const updatedTask = {
          due_date: newDueDate.toISOString().slice(0, 19).replace('T', ' '),
          status: newStatus,
        };
        await axios.put(`http://localhost:3000/tasks/edit/${selectedTask.id}`, updatedTask, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Update the tasks state
        setTasks(tasks.map(task => (task.id === selectedTask.id ? { ...task, due_date: updatedTask.due_date, status: updatedTask.status } : task)));
        setIsPopupOpen(false);
        setSelectedTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
        setError('Failed to update task. Please try again later.');
      }
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
      <Navbar />
      <div className="task-list-container">
        <Link to="/create" className="create-task-button">Create New Task</Link>
        <br />

        {error && <p className="error-message">{error}</p>}

        <ul className="task-list">
          {sortedTasks.length === 0 ? (
            <li>No tasks available.</li>
          ) : (
            sortedTasks.map((task, index) => (
              <li key={task.id} className="task-item">
                <span className="task-number">Task {index + 1}:</span>
                <div className="task-details">
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                  <p>Due Date: {task.due_date}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Status: {task.status}</p>
                </div>
                <div className="button-group">
                  <button className="edit-button" onClick={() => openEditPopup(task)}>Edit</button>
                  <button className="delete-button" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </li>
            ))
          )}
        </ul>

        {isPopupOpen && (
          <div className="popup">
            <div className="popup-content">
              <button className="close-button" onClick={() => setIsPopupOpen(false)}>✕</button>
              <h2>Edit Task</h2>
              <div>
                <label>Due Date:</label>
                <DatePicker
                  selected={newDueDate}
                  onChange={date => setNewDueDate(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
              <div>
                <label>Status:</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button className="back-button" onClick={handlePopupSubmit}>Update</button>
              <button className="back-button" onClick={() => setIsPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
