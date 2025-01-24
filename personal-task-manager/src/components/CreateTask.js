import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar'; 
import './CreateTask.css';

const CustomHeader = ({ date, decreaseMonth, increaseMonth }) => {
  return (
    <div className="custom-datepicker-header">
      <button onClick={decreaseMonth} className="custom-arrow">{"<"}</button>
      <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
      <button onClick={increaseMonth} className="custom-arrow">{">"}</button>
    </div>
  );
};

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      title,
      description,
      due_date: dueDate.toISOString().slice(0, 19).replace('T', ' '),
      category,
      priority,
      status
    };

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.post('http://localhost:5000/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Task created successfully:', response.data);
      navigate('/tasklist-taskmanager'); 
    } catch (error) {
      console.error('Error creating task:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="create-task-container">
      <Navbar />
      
      <form className="create-task-form" onSubmit={handleSubmit}>
        <h1>Create Task</h1>
        
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        
        <div className="date-time-picker-container">
          <DatePicker
            selected={dueDate}
            onChange={date => setDueDate(date)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            customInput={<input />}
            renderCustomHeader={CustomHeader} 
          />
          <span className="selected-date">
            {dueDate.toLocaleString('default', { month: 'long' })} {dueDate.getDate()}, {dueDate.getFullYear()}
          </span>
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
