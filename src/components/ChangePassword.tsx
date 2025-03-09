import React from 'react';
import { useForm } from '@mantine/form';
import { PasswordInput, Button, Box, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useApi } from "../service/apiService";

const api = useApi();

const ChangePassword = () => {

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validate: {
      currentPassword: (value) => (value.length < 6 ? 'Current password must be at least 6 characters' : null),
      newPassword: (value) => (value.length < 6 ? 'New password must be at least 6 characters' : null),
      confirmNewPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const response = await api.post('/account/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }) as { status: number };;

      if (response.status === 200) {
        notifications.show({
          title: 'Success',
          message: 'Password changed successfully!',
          color: 'green',
        });
        form.reset();
      }
    } catch (error) {
        notifications.show({
        title: 'Error',
        message: 'Failed to change password. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Box style={{ maxWidth: 400, margin: 'auto' }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          label="Current Password"
          placeholder="Enter your current password"
          {...form.getInputProps('currentPassword')}
          required
        />
        <PasswordInput
          label="New Password"
          placeholder="Enter your new password"
          {...form.getInputProps('newPassword')}
          required
          mt="md"
        />
        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm your new password"
          {...form.getInputProps('confirmNewPassword')}
          required
          mt="md"
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Change Password</Button>
        </Group>
      </form>
    </Box>
  );
};

export default ChangePassword;