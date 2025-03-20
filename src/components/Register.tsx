import React, { useState } from 'react';
import { TextInput, Button, Notification, Loader, Modal, Text, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from './Register.module.css';

interface RegisterFormValues {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
    validate: {
      username: (value) => (value.trim().length < 3 ? 'Username must be at least 3 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phoneNumber: (value) => (value.trim().length < 10 ? 'Phone number must be at least 10 digits' : null),
      password: (value) => (value.trim().length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/account/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmationModal = () => {
    if (form.isValid()) {
      setIsConfirmationModalOpen(true);
    } else {
      setError('Please fill out all fields correctly.');
    }
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const confirmRegistration = () => {
    setIsConfirmationModalOpen(false);
    form.onSubmit(handleSubmit)();
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Register</h1>
      <form onSubmit={form.onSubmit(openConfirmationModal)} className={classes.form}>
        <TextInput
          label="Username"
          placeholder="Enter your username"
          {...form.getInputProps('username')}
          required
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          {...form.getInputProps('email')}
          required
        />
        <TextInput
          label="Phone Number"
          placeholder="Enter your phone number"
          {...form.getInputProps('phoneNumber')}
          required
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          {...form.getInputProps('password')}
          required
        />

        {error && (
          <Notification icon={<IconX size={18} />} color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}

        {success && (
          <Notification icon={<IconCheck size={18} />} color="teal" onClose={() => setSuccess(false)}>
            Registration successful! Redirecting to login...
          </Notification>
        )}

        <Button type="submit" disabled={loading} className={classes.submitButton}>
          {loading ? <Loader size="sm" /> : 'Register'}
        </Button>
      </form>

      {/* Confirmation Modal */}
      <Modal
        opened={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title="Confirm Registration"
        centered
      >
        <Text>Are you sure you want to register with the following details?</Text>
        <Text mt="sm" fw={500}>Username: {form.values.username}</Text>
        <Text mt="sm" fw={500}>Email: {form.values.email}</Text>
        <Text mt="sm" fw={500}>Phone Number: {form.values.phoneNumber}</Text>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeConfirmationModal}>
            Cancel
          </Button>
          <Button color="green" onClick={confirmRegistration}>
            Confirm
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Register;