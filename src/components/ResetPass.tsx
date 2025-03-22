import React, { useState } from "react";
import { TextInput, Button, Notification, Loader } from "@mantine/core";
import { IconKey, IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import classes from "./ResetPass.module.css"; // Import the updated CSS module

const ResetPassword: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Simulate an API call to reset the password
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/account/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail,
          temporaryPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000); // Redirect to dashboard after success
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>
        <IconKey size={24} style={{ marginRight: "8px" }} />
        Reset Password
      </h2>

      <form onSubmit={handleSubmit} className={classes.form}>
        <TextInput
          label="User Email"
          type="email"
          placeholder="Enter user's email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
          className={classes.input}
        />
        <TextInput
          label="Temporary Password"
          type="password"
          placeholder="Enter temporary password"
          value={temporaryPassword}
          onChange={(e) => setTemporaryPassword(e.target.value)}
          required
          className={classes.input}
        />

        {error && (
          <Notification
            icon={<IconX size={18} />}
            color="red"
            onClose={() => setError("")}
            className={classes.notification}
          >
            {error}
          </Notification>
        )}

        {success && (
          <Notification
            icon={<IconCheck size={18} />}
            color="teal"
            onClose={() => setSuccess(false)}
            className={classes.notification}
          >
            Password reset successfully! Redirecting...
          </Notification>
        )}

        <Button type="submit" fullWidth mt="lg" disabled={loading} className={classes.submitButton}>
          {loading ? <Loader size="sm" /> : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;