/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import { TextInput, Button, Notification, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from './Register.module.css'; // Ensure you have this CSS module for styling

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
      const response = await fetch('https://localhost:7234/api/account/Register', {
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

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Register</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
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
    </div>
  );
};

export default Register;