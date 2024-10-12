import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditTask.css';

const EditTask = () => {
  const { id } = useParams();
  const [task, setTask] = useState({}); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateTime, setDueDateTime] = useState(new Date());
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        console.log(`Fetching task with id: ${id}`); 
        const response = await axios.get(`http://localhost:3000/tasks/${id}`);
        const taskData = response.data;

        if (taskData) {
          setTask(taskData); 
          setTitle(taskData.title || '');
          setDescription(taskData.description || '');
          setDueDateTime(new Date(taskData.due_date));
          setCategory(taskData.category || '');
          setPriority(taskData.priority || 'Medium');
          setStatus(taskData.status || 'Pending');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask(); 
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedTask = {
      title,
      description,
      due_date: dueDateTime.toISOString().slice(0, 19).replace('T', ' '), 
      category,
      priority,
      status
    };

    try {
      const token = localStorage.getItem('token'); 
      await axios.put(`http://localhost:3000/tasks/edit/${id}`, updatedTask, { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/tasklist');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('An error occurred while updating the task.');
    }
  };

  return (
    <div className="edit-task-container">
      <form className="edit-task-form" onSubmit={handleSubmit}>
        <h1>Edit Task</h1>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
        <div className="date-time-picker">
          <DatePicker
            selected={dueDateTime}
            onChange={date => setDueDateTime(date)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
          />
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
        <button type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default EditTask;
