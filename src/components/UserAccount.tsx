/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Loader, Notification, Button, Group, Select, Pagination } from '@mantine/core';
import { IconX, IconTrash, IconCheck } from '@tabler/icons-react';
import classes from './UserAccount.module.css'; // Ensure you have this CSS module for styling

interface User {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
}

const UserAccount: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null); // Selected roleId for filtering
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [usersPerPage] = useState(10); // Number of users per page

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      const response = await fetch('https://localhost:7234/api/user-role/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log(data); // Log the API response

      // Map the response to match the User interface
      const mappedUsers = data.map((user: any) => ({
        userId: user.userId,
        userName: user.userName || 'N/A', // Default value if username is missing
        roleId: user.roleId || 'N/A', // Default value if roleId is missing
        roleName: user.roleName || 'N/A', // Default value if roleName is missing
      }));

      setUsers(mappedUsers);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Remove a user
  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await fetch(`https://localhost:7234/api/User/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });

        if (!response.ok) {
          const errorData = await response.json(); // Parse the error response
          throw new Error(errorData.message || 'Failed to remove user');
        }

        setSuccess('User removed successfully!');
        fetchUsers(); // Refresh the user list
      } catch (err: any) {
        setError(err.message || 'An error occurred while removing the user');
      }
    }
  };

  // Filter users by roleId
  const filteredUsers = selectedRoleId
    ? users.filter((user) => user.roleId === selectedRoleId)
    : users;

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader size="lg" />; // Show a loader while data is being fetched
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>User Accounts</h2>

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

      {/* Role ID Filter */}
      <Group justify="flex-end" className={classes.filterContainer}>
        <Select
          placeholder="Filter by Role ID"
          value={selectedRoleId}
          onChange={setSelectedRoleId}
          data={[
            { value: '1', label: 'Role ID 1' },
            { value: '2', label: 'Role ID 2' },
            { value: '3', label: 'Role ID 3' },
            { value: '4', label: 'Role ID 4' },
          ]}
          clearable
        />
      </Group>

      <Table striped highlightOnHover className={classes.table}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Role ID</th>
            <th>Role Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.userName}</td>
              <td>{user.roleId}</td>
              <td>{user.roleName}</td>
              <td>
                <Button
                  leftSection={<IconTrash size={16} />} 
                  color="red"
                  onClick={() => handleRemoveUser(user.userId)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Group justify="center" mt="lg">
        <Pagination
          total={Math.ceil(filteredUsers.length / usersPerPage)}
          value={currentPage} 
          onChange={paginate}
          color="blue"
          radius="md"
        />
      </Group>
    </div>
  );
};

export default UserAccount;