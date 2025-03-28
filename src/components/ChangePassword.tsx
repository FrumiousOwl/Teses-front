import { useState } from "react";
import { Box, Button, PasswordInput, Group, Modal, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useApi } from "../service/apiService";
import styles from "./ChangePassword.module.css"; 

export default function ChangePassword() {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value) =>
        value.length < 6 ? "Current password must be at least 6 characters" : null,
      newPassword: (value) =>
        value.length < 6 ? "New password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      console.log("Submitting form with values:", values);

      const response = await api.post<{ currentPassword: string; newPassword: string }, any>(
        "/account/change-password",
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }
      );

      console.log("API Response:", response);

      if (response && typeof response === "string" && response.includes("Password changed successfully")) {
        console.log("Password change successful");

        notifications.show({
          title: "Success",
          message: "Your password has been successfully changed!",
          color: "green",
        });

        form.reset();
      } else {
        throw new Error("Unexpected API response: " + JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error changing password:", error);

      notifications.show({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to change password. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmationModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmPasswordChange = () => {
    setIsModalOpen(false);
    form.onSubmit(handleSubmit)();
  };

  return (
    <Box className={styles.container}>
      <h2 className={styles.title}>Change Password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          openConfirmationModal();
        }}
      >
        <PasswordInput
          label="Current Password"
          placeholder="Enter current password"
          {...form.getInputProps("currentPassword")}
          required
          className={styles.input}
        />

        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          {...form.getInputProps("newPassword")}
          required
          mt="md"
          className={styles.input}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm new password"
          {...form.getInputProps("confirmPassword")}
          required
          mt="md"
          className={styles.input}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isLoading} className={styles.submitButton}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </Group>
      </form>

      {/* ✅ Confirmation Modal */}
      <Modal opened={isModalOpen} onClose={closeModal} title="Confirm Password Change" centered>
        <Text className={styles.modalText}>Are you sure you want to change your password?</Text>

        <Group justify="flex-end" mt="md">
          <Button onClick={closeModal} variant="default" className={styles.cancelButton}>
            Cancel
          </Button>
          <Button onClick={confirmPasswordChange} color="green" className={styles.confirmButton}>
            Yes, Proceed
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}