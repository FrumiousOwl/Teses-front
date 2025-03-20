import React, { useState, useEffect } from 'react';
import { Table, Loader, Notification, Button, Group, Select, Pagination } from '@mantine/core';
import { IconX, IconTrash, IconCheck } from '@tabler/icons-react';
import classes from './UserAccount.module.css'; 

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
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [usersPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-role/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log(data);

      const mappedUsers = data.map((user: any) => ({
        userId: user.userId,
        userName: user.userName || 'N/A', 
        roleId: user.roleId || 'N/A',
        roleName: user.roleName || 'N/A',
      }));

      setUsers(mappedUsers);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch(`http://localhost:5000/api/User/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove user');
        }

        setSuccess('User removed successfully!');
        fetchUsers(); 
      } catch (err: any) {
        setError(err.message || 'An error occurred while removing the user');
      }
    }
  };

  const filteredUsers = selectedRoleId
    ? users.filter((user) => user.roleId === selectedRoleId)
    : users;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <Loader size="lg" />; 
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