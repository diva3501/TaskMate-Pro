import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Import date-picker library
import 'react-datepicker/dist/react-datepicker.css'; // Import date-picker styles
import './CreateTask.css';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date()); // Initialize due date with current date
  const [dueTime, setDueTime] = useState(new Date()); // Initialize due time with current time
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTask = {
      title,
      description,
      due_date: dueDate.toISOString(), // Convert due date to ISO string format
      due_time: dueTime.toISOString(), // Convert due time to ISO string format
      category,
      priority,
      status
    };

    axios.post('http://localhost:5000/tasks', newTask)
      .then(response => {
        navigate('/tasklist');
      })
      .catch(error => {
        console.error('Error creating task:', error);
      });
  };

  return (
    
    <div className="create-task-container">
      <div className="navbar">
        <nav className="stroke">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tasklist">Tasklist</Link></li>
            <li><Link to="/create">Create Task</Link></li>
            <li><Link to="/overdue">Overdue Tasks</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            
          </ul>
        </nav>
      </div>

      <form className="create-task-form" onSubmit={handleSubmit}>
        <h1>Create Task</h1>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <div className="date-time-picker">
          <DatePicker selected={dueDate} onChange={date => setDueDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
  <option value="">Select Category</option>
  <option value="Work">Work</option>
  <option value="Personal">Personal</option>
  <option value="Health">Health</option>
  <option value="Finance">Finance</option>
</select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
};

export default CreateTask;
