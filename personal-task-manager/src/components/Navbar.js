import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
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
  );
};

export default Navbar;
