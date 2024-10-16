import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Collaboration.css';
import { Button, InputGroup, FormControl, ListGroup, Spinner } from 'react-bootstrap';

const Collaboration = () => {
    const [groupName, setGroupName] = useState('');
    const [taskGroups, setTaskGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [receiverUsername, setReceiverUsername] = useState('');
    const [invitations, setInvitations] = useState([]);
    const [acceptedInvitations, setAcceptedInvitations] = useState([]); 
    const [rejectedInvitations, setRejectedInvitations] = useState([]); 
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
            if (error.response && error.response.status === 409) { 
                alert('User is already in the task group.');
            } else {
                console.error("Error inviting user:", error);
                alert(error.response ? error.response.data.error : 'Error inviting user'); 
            }
        }
    };

    const updateInvitationStatus = async (invitationId, action) => {
        try {
            const response = await axios.put(`http://localhost:5000/collaboration/invitations/${invitationId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert(response.data.message);
            fetchInvitations(); 
            if (action === 'accept') {
                setAcceptedInvitations(prev => [...prev, response.data]); 
            } else {
                setRejectedInvitations(prev => [...prev, response.data]); 
            }
        } catch (error) {
            console.error(`Error ${action} invitation:`, error);
            alert(`Failed to ${action} the invitation`);
        }
    };

    const deleteTodo = async (todoId) => {
        console.log('Deleting todo with ID:', todoId);
        try {
            const response = await axios.delete(`http://localhost:5000/collaboration/groups/${selectedGroup.id}/todo/${todoId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Delete response:', response);
            setTodos(todos.filter(todo => todo.id !== todoId));
            alert('To-Do item deleted successfully!');
        } catch (error) {
            console.error("Error deleting todo:", error.response ? error.response.data : error);
            alert('Failed to delete the To-Do item');
        }
    };
    

    return (
        <div className="collaboration-page">
            <Navbar />
            <div className="collaboration-container">
                <div className="sidebar">
                    <h2>Task Groups</h2>
                    <InputGroup className="mb-3">
                        <FormControl
                            placeholder="New Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Button onClick={createTaskGroup} disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Create Group'}
                        </Button>
                    </InputGroup>
                    <ListGroup>
                        {taskGroups.length ? taskGroups.map(group => (
                            <ListGroup.Item 
                                key={group.id} 
                                action 
                                onClick={() => selectGroup(group)} 
                                className="group-item"
                            >
                                {group.name}
                            </ListGroup.Item>
                        )) : <ListGroup.Item>No task groups available.</ListGroup.Item>}
                    </ListGroup>
                </div>
                <div className="main-content">
                    {selectedGroup ? (
                        <>
                            <h3>{selectedGroup.name} - To-Do List</h3>
                            <ListGroup className="todo-list">
                                {todos.length ? todos.map(todo => (
                                    <ListGroup.Item key={todo.id} className="todo-item">
                                        {todo.task_name}
                                        <Button variant="danger" size="sm" className="float-end" onClick={() => deleteTodo(todo.id)}>Delete</Button>
                                    </ListGroup.Item>
                                )) : <ListGroup.Item>No to-dos available for this group.</ListGroup.Item>}
                            </ListGroup>
                            <InputGroup className="mb-3 todo-creation">
                                <FormControl
                                    placeholder="New To-Do"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                />
                                <Button onClick={addTodo}>Add</Button>
                            </InputGroup>
                            <InputGroup className="mb-3 invite-section">
                                <FormControl
                                    placeholder="Invite User (Username)"
                                    value={receiverUsername}
                                    onChange={(e) => setReceiverUsername(e.target.value)}
                                />
                                <Button onClick={inviteUser}>Invite</Button>
                            </InputGroup>
                        </>
                    ) : (
                        <h3>Select a group to view tasks</h3>
                    )}
                </div>
                <div className="invitations-sidebar">
                    <h2>Invitations</h2>
                    <ListGroup>
                        {invitations.length ? invitations.map(invitation => (
                            <ListGroup.Item key={invitation.id} className="invitation-item">
                                {invitation.group_name || 'Unknown Group'}
                                <Button variant="success" size="sm" className="float-end" onClick={() => updateInvitationStatus(invitation.id, 'accept')}>Accept</Button>
                                <Button variant="danger" size="sm" className="float-end me-2" onClick={() => updateInvitationStatus(invitation.id, 'reject')}>Reject</Button>
                            </ListGroup.Item>
                        )) : <ListGroup.Item>No invitations available.</ListGroup.Item>}
                    </ListGroup>
                    <h2>Accepted Invitations</h2>
                    <ListGroup>
                        {acceptedInvitations.length ? acceptedInvitations.map(invitation => (
                            <ListGroup.Item key={invitation.id} className="invitation-item">
                                {invitation.group_name || 'Unknown Group'}
                                <span className="text-success float-end">Accepted</span>
                            </ListGroup.Item>
                        )) : <ListGroup.Item>No accepted invitations.</ListGroup.Item>}
                    </ListGroup>
                    <h2>Rejected Invitations</h2>
                    <ListGroup>
                        {rejectedInvitations.length ? rejectedInvitations.map(invitation => (
                            <ListGroup.Item key={invitation.id} className="invitation-item">
                                {invitation.group_name || 'Unknown Group'}
                                <span className="text-danger float-end">Rejected</span>
                            </ListGroup.Item>
                        )) : <ListGroup.Item>No rejected invitations.</ListGroup.Item>}
                    </ListGroup>
                </div>
            </div>
        </div>
    );
};

export default Collaboration;
