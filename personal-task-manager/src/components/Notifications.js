import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; 
import './Notifications.css'; 

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:3000/notifications', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const clearNotifications = async () => {
        try {
            await axios.delete('http://localhost:3000/notifications', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setNotifications([]); 
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case 'overdue':
                return 'notification-box notification-overdue';
            case 'completed':
                return 'notification-box notification-completed';
            case 'edited':
                return 'notification-box notification-edited';
            case 'created':
                return 'notification-box notification-created';
            default:
                return 'notification-box';
        }
    };

    return (
        <div className="notifications-container">
            <Navbar /> 
            <button onClick={clearNotifications} className="clear-button">
                Clear All Notifications
            </button>
            <div className="notifications">
                {notifications.length === 0 ? (
                    <div className="notification-box">No notifications available.</div>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification.id} className={getNotificationClass(notification.type)}>
                            <p>{notification.message}</p>
                            <small>{new Date(notification.created_at).toLocaleString()}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
