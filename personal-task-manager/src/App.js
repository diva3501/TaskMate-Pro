import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import EditTask from './components/EditTask';
import HomePage from './components/HomePage';
import OverdueTasks from './components/OverdueTasks';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasklist" element={<TaskList />} />
        <Route path="/" element={<TaskList />} />
        <Route path="/create" element={<CreateTask />} />
        <Route path="/edit/:id" element={<EditTask />} />
        <Route path="/overdue" element={<OverdueTasks />} />
      </Routes>
    </Router>
  );
}

export default App;
