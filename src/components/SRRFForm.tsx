import React, { useState, useEffect } from "react";
import { TextInput, Button, Table, Modal, Select, Pagination } from "@mantine/core";
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
<<<<<<< HEAD

  // Search states
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchWorkstation, setSearchWorkstation] = useState("");
=======
  
  const [formData, setFormData] = useState<Omit<HardwareRequest, "requestId">>({
    hardwareId: null,
    dateNeeded: new Date().toISOString().split("T")[0],
    name: "",
    department: "",
    workstation: "",
    problem: "",
    isFulfilled: false,
  });
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchWorkstation, setSearchWorkstation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const api = useApi();

  useEffect(() => {
    fetchRequests();
    fetchHardwareOptions();
<<<<<<< HEAD
  }, [searchName, searchDepartment, searchWorkstation]); // Fetch data when search filters change
=======
  }, [searchName, searchDepartment, searchWorkstation, currentPage]);
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da

  const fetchRequests = async () => {
    try {
      const queryParams = new URLSearchParams();
<<<<<<< HEAD
=======
      queryParams.append("Page", currentPage.toString());
      queryParams.append("Limit", itemsPerPage.toString());
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da
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

<<<<<<< HEAD
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
=======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editModalOpen && currentEditId) {
        await api.put(`/HardwareRequest/${currentEditId}`, formData);
      } else {
        await api.post("/HardwareRequest", formData);
        // If adding a new request, check if the number of requests exceeds the items per page
        if (requests.length % itemsPerPage === 0) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
      fetchRequests();
      setAddModalOpen(false);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error submitting hardware request:", error);
    }
  };

  // Calculate the total number of pages based on the total number of requests
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // Slice the requests array to display only the items for the current page
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h2 className={styles.title}>Hardware Requests</h2>

      {/* Search Filters */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <TextInput placeholder="Search Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
        <TextInput placeholder="Search Department" value={searchDepartment} onChange={(e) => setSearchDepartment(e.target.value)} />
        <TextInput placeholder="Search Workstation" value={searchWorkstation} onChange={(e) => setSearchWorkstation(e.target.value)} />
        <Button className={styles.searchButton} onClick={fetchRequests}>Search</Button>
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da
      </div>

      <Button className={styles.addButton} onClick={() => setAddModalOpen(true)}>Add Hardware Request</Button>

      <Table className={styles.table} style={{ fontSize: "9px" }}>
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
<<<<<<< HEAD
=======
            <th>Actions</th>
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da
          </tr>
        </thead>
        <tbody>
          {paginatedRequests.map((request) => (
            <tr key={request.requestId}>
              <td>{request.requestId}</td>
              <td>{request.dateNeeded.split("T")[0]}</td>
              <td>{request.name}</td>
              <td>{request.department}</td>
              <td>{request.workstation}</td>
              <td>{request.problem}</td>
              <td>{request.isFulfilled ? "Yes" : "No"}</td>
              <td>{request.hardwareId ?? "N/A"}</td>
<<<<<<< HEAD
=======
              <td className={styles.actionButtons}>
                <Button onClick={() => { setCurrentEditId(request.requestId); setEditModalOpen(true); }}>Edit</Button>
                <Button color="red" onClick={() => api.delete(`/HardwareRequest/${request.requestId}`).then(fetchRequests)}>Delete</Button>
              </td>
>>>>>>> deb6eb29b2a6198aebc5b29592c9760e332c33da
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} />

      {/* Add/Edit Request Modal */}
      <Modal opened={addModalOpen || editModalOpen} onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }} title={editModalOpen ? "Edit Hardware Request" : "Add Hardware Request"}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
          <TextInput label="Workstation" value={formData.workstation} onChange={(e) => setFormData({ ...formData, workstation: e.target.value })} required />
          <TextInput label="Problem" value={formData.problem} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} required />
          <Select label="Hardware (Required)" data={hardwareOptions} onChange={(value) => setFormData({ ...formData, hardwareId: value ? parseInt(value) : null })} />
          <Button type="submit">{editModalOpen ? "Update" : "Submit"}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default SRRFForm;