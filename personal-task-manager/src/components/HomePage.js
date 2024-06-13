import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const quotes = [
  "The secret of getting ahead is getting started. - Mark Twain",
  "Your time is limited, don’t waste it living someone else’s life. - Steve Jobs",
  "The best way to predict the future is to create it. - Peter Drucker",
  "You don’t have to be great to start, but you have to start to be great. - Zig Ziglar"
];

const HomePage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [taskStatistics, setTaskStatistics] = useState({
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tasks/statistics');
        setTaskStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    const fetchUpcomingTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tasks');
        const tasks = response.data;
        const upcoming = tasks.filter(task => new Date(task.due_date) > new Date() && task.status !== 'Completed').slice(0, 3);
        setUpcomingTasks(upcoming);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchStatistics();
    fetchUpcomingTasks();
  }, []);

  return (
    <div className="homepage-container">
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

      <div className="dashboard">
      <br></br>
        <div className="motivational-quotes">
          <h2>Hello User,</h2>
          <p className="quote">{quotes[currentQuoteIndex]}</p>
        </div>

        <div className="task-statistics">
          <h2>Task Statistics</h2>
          <p>Completed: {taskStatistics.completed}</p>
          <p>Pending: {taskStatistics.pending}</p>
          <p>Overdue: {taskStatistics.overdue}</p>
        </div>

        <div className="upcoming-tasks">
          <h2>Upcoming Tasks</h2>
          <ul>
            {upcomingTasks.map(task => (
              <li key={task.id}>{task.title} - Due in {Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))} days</li>
            ))}
          </ul>
        </div>

        <div className="app-points">
          <h2>Why Use Personal Task Manager?</h2>
          <ul>
            <li>Organize your tasks efficiently</li>
            <li>Set priorities and deadlines</li>
            <li>Track your progress</li>
            <li>Stay motivated with daily goals</li>
            <li>Simple and intuitive interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
