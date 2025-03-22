import React, { useState, useEffect } from 'react';
import { Table, Loader, Notification, Button, Group, Select, Pagination, Modal } from '@mantine/core';
import { IconX, IconTrash, IconCheck, IconEdit } from '@tabler/icons-react';
import classes from './UserAccount.module.css'; // Ensure you have this CSS module for styling

// Define the User interface
interface User {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
}

// Define the API response interfaces
interface ApiUser {
  id: string; // Ensure this matches the backend response
  userName: string;
  email: string;
  phoneNumber: string;
}

interface ApiUserRole {
  userId: string; // Ensure this matches the backend response
  roleId: string;
  roleName: string;
}

// Define the UpdateUserRoleDto interface
interface UpdateUserRoleDto {
  userId: string;
  newRole: string; // This should be one of the valid role names
}

const UserAccount: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null); // Selected roleId for filtering
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [usersPerPage] = useState(10); // Number of users per page
  const [editModalOpen, setEditModalOpen] = useState(false); // State for edit modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Selected user for editing
  const [newRole, setNewRole] = useState<string | null>(null); // New role for the selected user

  // Fetch users from both endpoints and merge the data
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage

      // Fetch all users from /api/User
      const usersResponse = await fetch('http://localhost:5000/api/User', {
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

      // Fetch user roles from /api/user-role/all
      const rolesResponse = await fetch('http://localhost:5000/api/user-role/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!rolesResponse.ok) {
        const errorData = await rolesResponse.json();
        throw new Error(errorData.message || 'Failed to fetch user roles');
      }

      const rolesData: ApiUserRole[] = await rolesResponse.json();

      // Merge the data
      const mergedUsers = usersData.map((user) => {
        // Find the corresponding role information for the user
        const roleInfo = rolesData.find((role) => role.userId === user.id); // Match userId from /api/User with userId from /api/user-role/all
        return {
          userId: user.id, // Use userId from /api/User
          userName: user.userName || 'N/A', // Use userName from /api/User
          roleId: roleInfo ? roleInfo.roleId : 'N/A', // Use roleId from /api/user-role/all if available
          roleName: roleInfo ? roleInfo.roleName : 'N/A', // Use roleName from /api/user-role/all if available
        };
      });

      setUsers(mergedUsers);
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

  // Remove a user
  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
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
        fetchUsers(); // Refresh the user list
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'An error occurred while removing the user');
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  };

  // Open edit modal for a user
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.roleName); // Set the current role as the default value
    setEditModalOpen(true);
  };

  // Update user role
  const handleUpdateUserRole = async () => {
    if (!selectedUser || !newRole) {
      setError('User or new role is not selected.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      const requestBody: UpdateUserRoleDto = {
        userId: selectedUser.userId,
        newRole: newRole, // Use the selected role name
      };

      const response = await fetch('http://localhost:5000/api/user-role/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      setSuccess('User role updated successfully!');
      fetchUsers(); // Refresh the user list
      setEditModalOpen(false); // Close the modal
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while updating the user role');
      } else {
        setError('An unknown error occurred');
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
      <h2 className={classes.title}>User Roles</h2>

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
            <th>Actions</th>
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
                <Group>
                  <Button
                    leftSection={<IconEdit size={16} />}
                    color="blue"
                    onClick={() => openEditModal(user)}
                  >
                    Edit Role
                  </Button>
                  <Button
                    leftSection={<IconTrash size={16} />}
                    color="red"
                    onClick={() => handleRemoveUser(user.userId)}
                  >
                    Remove
                  </Button>
                </Group>
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

      {/* Edit Role Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User Role"
      >
        {selectedUser && (
          <div>
            <Select
              label="Select New Role"
              placeholder="Choose a role"
              value={newRole}
              onChange={(value) => setNewRole(value)}
              data={[
                { value: 'SystemManager', label: 'System Manager' },
                { value: 'RequestManager', label: 'Request Manager' },
                { value: 'InventoryManager', label: 'Inventory Manager' },
                { value: 'User', label: 'User' },
              ]}
              required
            />
            <Button
              fullWidth
              mt="md"
              onClick={handleUpdateUserRole}
            >
              Update Role
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserAccount;