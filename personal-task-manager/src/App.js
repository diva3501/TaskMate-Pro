import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import HomePage from './components/HomePage';
import OverdueTasks from './components/OverdueTasks';
import SignUp from './components/Signup';
import Login from './components/Login';
import Notifications from './components/Notifications'; 
import Collaboration from './components/Collaboration';

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/homepage" element={<HomePage />} />
       <Route path="/collaborative-to-dos-taskmanager" element={<Collaboration />} />
       <Route path="/tasklist-taskmanager" element={<TaskList />} />
       <Route path="/createtask-taskmanager" element={<CreateTask />} />
       <Route path="/overduetask-taskmanager" element={<OverdueTasks />} />
       <Route path="/notifications" element={<Notifications />} /> 
       <Route path="/signuppage" element={<SignUp />} />
       <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
