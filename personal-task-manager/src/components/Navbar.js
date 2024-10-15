import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa'; 
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('http://localhost:5000/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        }
    };

    return (
        <div className="navbar">
            <nav className="stroke">
                <ul>
                    <li><Link to="/homepage">Home</Link></li>
                    <li><Link to="/tasklist">Tasklist</Link></li>
                    <li><Link to="/create">Create Task</Link></li>
                    <li><Link to="/overdue">Overdue Tasks</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li>
                        <Link to="/notifications" className="notification-icon">
                            <FaBell style={{ color: unreadCount > 0 ? 'red' : 'black', fontSize: '1.5em' }} />
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;
