import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Collaboration.css';

const Collaboration = () => {
    const [groupName, setGroupName] = useState('');
    const [taskGroups, setTaskGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [receiverUsername, setReceiverUsername] = useState('');
    const [invitations, setInvitations] = useState([]);
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTaskGroups();
        fetchInvitations();
    }, []);

    const fetchTaskGroups = async () => {
        try {
            const response = await axios.get('http://localhost:5000/collaboration/groups', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTaskGroups(response.data || []);
        } catch (error) {
            console.error("Error fetching task groups:", error.response ? error.response.data : error.message);
        }
    };

    const fetchInvitations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/collaboration/invitations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setInvitations(response.data || []); 
        } catch (error) {
            console.error("Error fetching invitations:", error);
        }
    };

    const createTaskGroup = async () => {
        if (!groupName) return;
        setLoading(true);
        const ownerId = localStorage.getItem('userId'); 
        try {
            const response = await axios.post('http://localhost:5000/collaboration/groups', {
                name: groupName,
                owner_id: ownerId 
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTaskGroups(prevGroups => [...prevGroups, response.data]);
            setGroupName('');
            alert('Task group created successfully!');
        } catch (error) {
            console.error("Error creating task group:", error);
            alert('Failed to create task group');
        } finally {
            setLoading(false);
        }
    };

    const selectGroup = async (group) => {
        setSelectedGroup(group);
        await fetchGroupTodos(group.id);
    };

    const fetchGroupTodos = async (groupId) => {
        try {
            const response = await axios.get(`http://localhost:5000/collaboration/groups/${groupId}/todo`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTodos(response.data || []); 
        } catch (error) {
            console.error("Error fetching group todos:", error);
        }
    };

    const addTodo = async () => {
        if (!newTodo || !selectedGroup) return;
        try {
            const response = await axios.post(`http://localhost:5000/collaboration/groups/${selectedGroup.id}/todo`, { task_name: newTodo }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTodos([...todos, response.data]);
            setNewTodo('');
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const inviteUser = async () => {
        if (!receiverUsername || !selectedGroup) return;
        console.log(`Inviting user ${receiverUsername} to group ID ${selectedGroup.id}`);
        try {
            const response = await axios.post(`http://localhost:5000/collaboration/groups/${selectedGroup.id}/invite`, {
                collaboration_id: selectedGroup.id,
                receiver_username: receiverUsername
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert(response.data.message);
            setReceiverUsername('');
            fetchInvitations();
        } catch (error) {
            console.error("Error inviting user:", error);
            alert(error.response ? error.response.data.error : 'Error inviting user');
        }
    };

    const updateInvitationStatus = async (invitationId, action) => {
        try {
            const response = await axios.put(`http://localhost:5000/collaboration/invitations/${invitationId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert(response.data.message);
            setInvitations(prevInvitations => prevInvitations.filter(invitation => invitation.id !== invitationId));
        } catch (error) {
            console.error(`Error ${action} invitation:`, error);
            alert(`Failed to ${action} the invitation`);
        }
    };

    return (
        <div className="collaboration-page">
            <Navbar />
            <div className="collaboration-container">
                <div className="sidebar">
                    <h2>Task Groups</h2>
                    <div className="group-creation">
                        <input
                            type="text"
                            placeholder="New Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <button onClick={createTaskGroup} disabled={loading}>Create Group</button>
                    </div>
                    <ul className="group-list">
                        {taskGroups.length ? taskGroups.map(group => (
                            <li key={group.id} onClick={() => selectGroup(group)}>
                                {group.name}
                            </li>
                        )) : <li>No task groups available.</li>}
                    </ul>
                </div>
                <div className="main-content">
                    {selectedGroup ? (
                        <>
                            <h3>{selectedGroup.name} - To-Do List</h3>
                            <ul className="todo-list">
                                {todos.length ? todos.map(todo => (
                                    <li key={todo.id}>{todo.task_name}</li>
                                )) : <li>No to-dos available for this group.</li>}
                            </ul>
                            <div className="todo-creation">
                                <input
                                    type="text"
                                    placeholder="New To-Do"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                />
                                <button onClick={addTodo}>Add</button>
                            </div>
                            <div className="invite-section">
                                <input
                                    type="text"
                                    placeholder="Invite User (Username)"
                                    value={receiverUsername}
                                    onChange={(e) => setReceiverUsername(e.target.value)}
                                />
                                <button onClick={inviteUser}>Invite</button>
                            </div>
                        </>
                    ) : (
                        <h3>Select a group to view tasks</h3>
                    )}
                </div>
                <div className="invitations-sidebar">
                    <h2>Invitations</h2>
                    <ul>
                        {invitations.length ? invitations.map(invitation => (
                            <li key={invitation.id}>
                                {invitation.group_name || 'Unknown Group'}
                                <button onClick={() => updateInvitationStatus(invitation.id, 'accept')}>Accept</button>
                                <button onClick={() => updateInvitationStatus(invitation.id, 'reject')}>Reject</button>
                            </li>
                        )) : <li>No invitations available.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Collaboration;
