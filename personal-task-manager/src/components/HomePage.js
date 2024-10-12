import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
          const token = localStorage.getItem('token'); 
          const response = await axios.get('http://localhost:3000/tasks/statistics', {
              headers: {
                  Authorization: `Bearer ${token}`, 
              },
          });
          setTaskStatistics(response.data);
      } catch (error) {
          console.error('Error fetching statistics:', error.response?.data || error.message);
      }
    };

    const fetchUpcomingTasks = async () => {
      try {
          const token = localStorage.getItem('token'); 
          const response = await axios.get('http://localhost:3000/tasks', {
              headers: {
                  Authorization: `Bearer ${token}`, 
              },
          });
          const tasks = response.data;
          const upcoming = tasks.slice(0, 3); 
          setUpcomingTasks(upcoming);
      } catch (error) {
          console.error('Error fetching tasks:', error.response?.data || error.message);
      }
    };

    fetchStatistics();
    fetchUpcomingTasks();
  }, []);

  return (
    <div className="homepage-container">
      <Navbar /> 

      <div className="dashboard container mt-5">
        <h2 className="text-center">Welcome Back, User!</h2>

        <div className="quote-section mb-4 text-center">
          <div className="quote-card p-4">
            <p className="quote animated-quote">{quotes[currentQuoteIndex]}</p>
          </div>
        </div>

        <div className="task-statistics row text-center mb-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="stat-card card p-3">
              <h4>Completed</h4>
              <p className="completed">{taskStatistics.completed}</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="stat-card card p-3">
              <h4>Pending</h4>
              <p className="pending">{taskStatistics.pending}</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="stat-card card p-3">
              <h4>Overdue</h4>
              <p className="overdue">{taskStatistics.overdue}</p>
            </div>
          </div>
        </div>

        <div className="upcoming-tasks card p-4 mb-4">
          <h2 className="text-center">Upcoming Tasks</h2>
          <ul className="list-group">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <li key={task.id} className="list-group-item">
                  {task.title} - Due in {Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                </li>
              ))
            ) : (
              <li className="list-group-item">No upcoming tasks!</li>
            )}
          </ul>
        </div>

        <div className="app-points card p-4 mb-4">
          <h2 className="text-center">Why Use Personal Task Manager?</h2>
          <ul className="list-unstyled">
            <li>➔ Organize your tasks efficiently</li>
            <li>➔ Set priorities and deadlines</li>
            <li>➔ Track your progress</li>
            <li>➔ Stay motivated with daily goals</li>
            <li>➔ Simple and intuitive interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
