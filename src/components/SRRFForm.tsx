import React, { useState, useEffect } from "react";
import { TextInput, Button, Table, Modal, Checkbox, Select } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./SRRFForm.module.css";

type HardwareRequest = {
  requestId: number;
  hardwareId: number | null;
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

  // Search states
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchWorkstation, setSearchWorkstation] = useState("");

  const api = useApi();

  useEffect(() => {
    fetchRequests();
    fetchHardwareOptions();
  }, [searchName, searchDepartment, searchWorkstation]); // Fetch data when search filters change

  const fetchRequests = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchName) queryParams.append("Name", searchName);
      if (searchDepartment) queryParams.append("Department", searchDepartment);
      if (searchWorkstation) queryParams.append("Workstation", searchWorkstation);
      
      const data = await api.get<HardwareRequest[]>(`/HardwareRequest?${queryParams.toString()}`);
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

  return (
    <div className={styles.wrapper}>
      <h2>Hardware Requests</h2>

      {/* Search Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <TextInput
          placeholder="Search Department"
          value={searchDepartment}
          onChange={(e) => setSearchDepartment(e.target.value)}
        />
        <TextInput
          placeholder="Search Workstation"
          value={searchWorkstation}
          onChange={(e) => setSearchWorkstation(e.target.value)}
        />
        <Button onClick={fetchRequests}>Search</Button>
      </div>

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Date Needed</th>
            <th>Name</th>
            <th>Department</th>
            <th>Workstation</th>
            <th>Problem</th>
            <th>Is Fulfilled</th>
            <th>Hardware ID</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.requestId}>
              <td>{request.requestId}</td>
              <td>{request.dateNeeded.split("T")[0]}</td>
              <td>{request.name}</td>
              <td>{request.department}</td>
              <td>{request.workstation}</td>
              <td>{request.problem}</td>
              <td>{request.isFulfilled ? "Yes" : "No"}</td>
              <td>{request.hardwareId ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SRRFForm;
