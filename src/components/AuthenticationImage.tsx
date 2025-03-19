/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
} from "@mantine/core";
import classes from "./AuthenticationImage.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AuthenticationImage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Attempting login for:", username);

      const response = await axios.post(
        `${API_BASE_URL}/api/account/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const token = response.data.token;
        console.log("✅ Login successful! Token received.");
        localStorage.setItem("token", token);

        // Decode the token to get the user role
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userRole = decodedToken.role;

        // Redirect based on the user role
        if (userRole === "User") {
          navigate("/dashboard/hardwareRequest");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          WELCOME
        </Title>

        <form onSubmit={handleLogin}>
          <TextInput
            label="Username"
            placeholder="Enter your username"
            size="md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button fullWidth mt="xl" size="md" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Paper>
    </div>
  );
}