import React, { useState, useEffect } from "react";
import { TextInput, Button, Table, Modal, Select, Pagination, Checkbox } from "@mantine/core";
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<HardwareRequest, "requestId">>({
    hardwareId: null,
    dateNeeded: new Date().toISOString().slice(0, 16),
    name: "",
    department: "",
    workstation: "",
    problem: "",
    isFulfilled: false,
  });

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchWorkstation, setSearchWorkstation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const api = useApi();

  // Fetch the username and role from the token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const username = decodedToken.given_name;
        const role = decodedToken.role;

        setUsername(username);
        setUserRole(role);

        setFormData((prevData) => ({
          ...prevData,
          name: username || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Reset form data when the Add Modal is opened
  useEffect(() => {
    if (addModalOpen) {
      setFormData((prevData) => ({
        ...prevData,
        hardwareId: null,
        dateNeeded: new Date().toISOString().slice(0, 16),
        department: "",
        workstation: "",
        problem: "",
        isFulfilled: false,
        name: username || "",
      }));
    }
  }, [addModalOpen, username]);

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchRequests();
      fetchHardwareOptions();
    } else {
      window.location.href = "/login";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName, searchDepartment, searchWorkstation, currentPage]);

  const fetchRequests = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("Page", currentPage.toString());
      queryParams.append("Limit", itemsPerPage.toString());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editModalOpen && currentEditId) {
        await api.put(`/HardwareRequest/${currentEditId}`, formData);
      } else {
        await api.post("/HardwareRequest", formData);
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

  const handleDeleteClick = (requestId: number) => {
    setRequestToDelete(requestId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (requestToDelete) {
      try {
        await api.delete(`/HardwareRequest/${requestToDelete}`);
        fetchRequests();
      } catch (error) {
        console.error("Error deleting hardware request:", error);
      } finally {
        setDeleteModalOpen(false);
        setRequestToDelete(null);
      }
    }
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Function to format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  // Function to generate mock serial numbers
  const generateSerialNumber = (index: number) => {
    return `AAA${String(index + 1).padStart(3, "0")}`; // Example: AAA001, AAA002, etc.
  };

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px" }}>
      <h2 className={styles.title} style={{ fontSize: "18px", marginBottom: "10px" }}>Hardware Requests</h2>

      {/* Search Filters */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Department"
          value={searchDepartment}
          onChange={(e) => setSearchDepartment(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Workstation"
          value={searchWorkstation}
          onChange={(e) => setSearchWorkstation(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <Button className={styles.searchButton} onClick={fetchRequests} style={{ flex: "none" }}>Search</Button>
      </div>

      <Button className={styles.addButton} onClick={() => setAddModalOpen(true)} style={{ marginBottom: "10px" }}>Add Hardware Request</Button>

      {/* Scrollable Table Container */}
      <div style={{ overflowX: "auto", marginBottom: "20px" }}>
        <Table className={styles.table} style={{ fontSize: "12px", minWidth: "1100px" }}>
          <thead>
            <tr>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Index</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Request ID</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Date Needed</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Name</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Department</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Workstation</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Problem</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Is Fulfilled</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Serial No</th> {/* Moved Serial No column here */}
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Hardware ID</th>
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((request, index) => (
              <tr key={request.requestId}>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{index + 1}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.requestId}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{formatDateTime(request.dateNeeded)}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.name}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.department}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.workstation}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.problem}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.isFulfilled ? "Yes" : "No"}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{generateSerialNumber(index)}</td> {/* Moved Serial No here */}
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.hardwareId ?? "N/A"}</td>
                <td style={{ padding: "6px", whiteSpace: "nowrap" }} className={styles.actionButtons}>
                  <Button size="xs" onClick={() => { setCurrentEditId(request.requestId); setFormData(request); setEditModalOpen(true); }}>Edit</Button>
                  {userRole === "RequestManager" && (
                    <Button size="xs" color="red" onClick={() => handleDeleteClick(request.requestId)}>Delete</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" style={{ marginBottom: "10px" }} />

      {/* Add/Edit Request Modal */}
      <Modal
        opened={addModalOpen || editModalOpen}
        onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }}
        title={editModalOpen ? "Edit Hardware Request" : "Add Hardware Request"}
        size="sm"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextInput label="Name" value={formData.name} readOnly required />
          <TextInput label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
          <TextInput label="Workstation" value={formData.workstation} onChange={(e) => setFormData({ ...formData, workstation: e.target.value })} required />
          <TextInput label="Problem" value={formData.problem} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} required />
          <TextInput
            label="Date Needed"
            type="datetime-local"
            value={formData.dateNeeded}
            onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
            required
            style={{ marginTop: "10px" }}
          />
          <Select label="Hardware (Required)" data={hardwareOptions} onChange={(value) => setFormData({ ...formData, hardwareId: value ? parseInt(value) : null })} />
          {userRole === "RequestManager" && (
            <Checkbox
              label="Is Fulfilled"
              checked={formData.isFulfilled}
              onChange={(e) => setFormData({ ...formData, isFulfilled: e.currentTarget.checked })}
              style={{ marginTop: "10px" }}
            />
          )}
          <Button type="submit" style={{ marginTop: "10px" }}>{editModalOpen ? "Update" : "Submit"}</Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <p>Are you sure you want to delete this hardware request?</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SRRFForm;