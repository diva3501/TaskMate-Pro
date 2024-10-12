import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import EditTask from './components/EditTask';
import HomePage from './components/HomePage';
import OverdueTasks from './components/OverdueTasks';
import SignUp from './components/Signup';
import Login from './components/Login';
import Notifications from './components/Notifications'; 

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/homepage" element={<HomePage />} />
       <Route path="/tasklist" element={<TaskList />} />
       <Route path="/create" element={<CreateTask />} />
       <Route path="/edit/:id" element={<EditTask />} />
       <Route path="/overdue" element={<OverdueTasks />} />
       <Route path="/notifications" element={<Notifications />} /> 
       <Route path="/signuppage" element={<SignUp />} />
       <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
