import React, { useState, useEffect } from 'react';
import { Table, Loader, Notification, Button, Group, TextInput, Modal } from '@mantine/core';
import { IconX, IconCheck, IconEdit } from '@tabler/icons-react';
import classes from './UserEmail.module.css';

interface User {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

interface ApiUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
}

interface UpdateUserDto {
  userName: string;
  email: string;
  phoneNumber: string;
}

const Email: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 
  const [newEmail, setNewEmail] = useState<string>(''); 
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>(''); 

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token'); 

      const usersResponse = await fetch('https://localhost:5000/api/User', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const usersData: ApiUser[] = await usersResponse.json();

      const mappedUsers = usersData.map((user) => ({
        userId: user.id,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }));

      setUsers(mappedUsers);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while fetching users');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewEmail(user.email); 
    setNewPhoneNumber(user.phoneNumber); 
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      setError('User is not selected.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      const requestBody: UpdateUserDto = {
        userName: selectedUser.userName,
        email: newEmail,
        phoneNumber: newPhoneNumber,
      };

      const response = await fetch(`https://localhost:5000/api/User/${selectedUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setSuccess('User updated successfully!');
      fetchUsers(); 
      setEditModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while updating the user');
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader size="lg" />; 
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>User Emails and Phone Numbers</h2>

      {/* Success Notification */}
      {success && (
        <Notification
          icon={<IconCheck size={18} />}
          color="teal"
          onClose={() => setSuccess(null)}
          className={classes.notification}
        >
          {success}
        </Notification>
      )}

      {/* Error Notification */}
      {error && (
        <Notification
          icon={<IconX size={18} />}
          color="red"
          onClose={() => setError(null)}
          className={classes.notification}
        >
          {error}
        </Notification>
      )}

      <Table striped highlightOnHover className={classes.table}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.userName}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>
                <Group>
                  <Button
                    leftSection={<IconEdit size={16} />}
                    color="blue"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Email and Phone Number Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User Email and Phone Number"
      >
        {selectedUser && (
          <div>
            <TextInput
              label="Email"
              placeholder="Enter new email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.currentTarget.value)}
              required
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter new phone number"
              value={newPhoneNumber}
              onChange={(event) => setNewPhoneNumber(event.currentTarget.value)}
              required
            />
            <Button
              fullWidth
              mt="md"
              onClick={handleUpdateUser}
            >
              Update
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Email;