// src/components/AuthenticationImage.tsx
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,

} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import classes from './AuthenticationImage.module.css';

export function AuthenticationImage() {
  const navigate = useNavigate();          
                                                   // use to navigate the Navbarsegment upon clicking the login
  const handleLogin = () => {
    // Add authentication logic here if needed
    navigate('/dashboard');
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome to eData Services SRRF
        </Title>

        <TextInput label="Email address" placeholder="hello@gmail.com" size="md" />
        <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" />
        <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </div>
  );
}
