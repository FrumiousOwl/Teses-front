import React, { useState, useEffect } from "react";
import { TextInput, Button, Table, Modal, Checkbox, Select } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./SRRFForm.module.css";

type HardwareRequest = {
  requestId: number;
  hardwareId: number | null; // Allow hardwareId to be optional
  dateNeeded: string;
  name: string;
  department: string;
  workstation: string;
  problem: string;
  isFulfilled: boolean;
};

const SRRFForm: React.FC = () => {
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  const [hardwareOptions, setHardwareOptions] = useState<{ value: string; label: string }[]>([]);

  const [formData, setFormData] = useState<Omit<HardwareRequest, "requestId">>({
    hardwareId: null, // Default to null instead of 0
    dateNeeded: new Date().toISOString().split("T")[0],
    name: "",
    department: "",
    workstation: "",
    problem: "",
    isFulfilled: false,
  });

  const api = useApi();

  useEffect(() => {
    fetchRequests();
    fetchHardwareOptions();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api.get<HardwareRequest[]>("/HardwareRequest");
      setRequests(data);
    } catch (error) {
      console.error("Error fetching hardware requests:", error);
    }
  };

  const fetchHardwareOptions = async () => {
    try {
      const data = await api.get<{ hardwareId: number; name: string }[]>("/Hardware");
      setHardwareOptions(data.map((hw) => ({ value: hw.hardwareId.toString(), label: hw.name })));
    } catch (error) {
      console.error("Error fetching hardware options:", error);
    }
  };

  const handleAddHardwareRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Convert hardwareId to null if not selected
      const newRequest = {
        ...formData,
        hardwareId: formData.hardwareId ? formData.hardwareId : null,
        dateNeeded: new Date(formData.dateNeeded).toISOString(),
      };

      const addedRequest = await api.post<typeof newRequest, HardwareRequest>(
        "/HardwareRequest",
        newRequest
      );
      setRequests((prev) => [...prev, addedRequest]);
      setAddModalOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error adding hardware request:", error);
    }
  };

  const handleEditHardwareRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentEditId === null) return;

    try {
      const editedRequest = {
        ...formData,
        hardwareId: formData.hardwareId ? formData.hardwareId : null, // Allow null
        dateNeeded: new Date(formData.dateNeeded).toISOString(),
      };

      const updatedRequest = await api.put<typeof editedRequest, HardwareRequest>(
        `/HardwareRequest/${currentEditId}`,
        editedRequest
      );

      setRequests((prev) =>
        prev.map((request) =>
          request.requestId === currentEditId ? updatedRequest : request
        )
      );

      setEditModalOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error editing hardware request:", error);
    }
  };

  const handleDeleteHardwareRequest = async (requestId: number) => {
    try {
      await api.delete(`/HardwareRequest/${requestId}`);
      setRequests((prev) => prev.filter((request) => request.requestId !== requestId));
    } catch (error) {
      console.error("Error deleting hardware request:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      hardwareId: null, // Reset to null
      dateNeeded: new Date().toISOString().split("T")[0],
      name: "",
      department: "",
      workstation: "",
      problem: "",
      isFulfilled: false,
    });
  };

  return (
    <div className={styles.wrapper}>
      <Button onClick={() => setAddModalOpen(true)}>Add Hardware Request</Button>

      {/* Add Modal */}
      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Hardware Request">
        <form onSubmit={handleAddHardwareRequest}>
          <Select
            label="Select Hardware (Optional)"
            data={hardwareOptions}
            value={formData.hardwareId ? formData.hardwareId.toString() : ""}
            onChange={(value) => setFormData({ ...formData, hardwareId: value ? Number(value) : null })}
          />
          <TextInput
            label="Date Needed"
            type="date"
            value={formData.dateNeeded}
            onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
            required
          />
          <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
          <TextInput label="Workstation" value={formData.workstation} onChange={(e) => setFormData({ ...formData, workstation: e.target.value })} required />
          <TextInput label="Problem" value={formData.problem} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} required />
          <Checkbox label="Is Fulfilled" checked={formData.isFulfilled} onChange={(e) => setFormData({ ...formData, isFulfilled: e.currentTarget.checked })} />
          <Button type="submit">Submit</Button>
        </form>
      </Modal>

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <th>Hardware</th>
            <th>Date Needed</th>
            <th>Name</th>
            <th>Department</th>
            <th>Workstation</th>
            <th>Problem</th>
            <th>Is Fulfilled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.requestId}>
              <td>{request.hardwareId ? request.hardwareId : "N/A"}</td>
              <td>{new Date(request.dateNeeded).toLocaleDateString()}</td>
              <td>{request.name}</td>
              <td>{request.department}</td>
              <td>{request.workstation}</td>
              <td>{request.problem}</td>
              <td>{request.isFulfilled ? "Yes" : "No"}</td>
              <td>
                <Button
                  onClick={() => {
                    setCurrentEditId(request.requestId);
                    setFormData({
                      hardwareId: request.hardwareId,
                      dateNeeded: request.dateNeeded.split("T")[0],
                      name: request.name,
                      department: request.department,
                      workstation: request.workstation,
                      problem: request.problem,
                      isFulfilled: request.isFulfilled,
                    });
                    setEditModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button color="red" onClick={() => handleDeleteHardwareRequest(request.requestId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SRRFForm;
