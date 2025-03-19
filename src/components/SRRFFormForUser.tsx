/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty-pattern */
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
  serialNo: string;
};

const SRRFFormForUser: React.FC = () => {
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  const [hardwareOptions, setHardwareOptions] = useState<{ value: string; label: string }[]>([]);
  const [, setDeleteModalOpen] = useState(false);
  const [, setRequestToDelete] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState(false);
  const [] = useState(true);

  const [formData, setFormData] = useState<Omit<HardwareRequest, "requestId">>({
    hardwareId: null,
    dateNeeded: new Date().toISOString().slice(0, 16),
    name: "",
    department: "",
    workstation: "",
    problem: "",
    isFulfilled: false,
    serialNo: "",
  });

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchWorkstation, setSearchWorkstation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const api = useApi();

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
        SerialNo: "",
      }));
    }
  }, [addModalOpen, username]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchRequests();
      fetchHardwareOptions();
    } else {
      window.location.href = "/login";
    }
  }, [searchName, searchDepartment, searchWorkstation, currentPage]);

  const fetchRequests = async () => {
    try {
      let apiUrl = "/HardwareRequest";
  
        apiUrl += `/${username}`;

      
  
      const data = await api.get<HardwareRequest[]>(apiUrl);
  
      const sortedData = data.sort((a, b) => b.requestId - a.requestId);
      setRequests(sortedData);
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
        // Add the new request to the top of the list
        setRequests((prevRequests) => [formData as HardwareRequest, ...prevRequests]);
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


  const handleSort = () => {
    setIsSorted(!isSorted);
    setRequests((prevRequests) =>
      [...prevRequests].sort((a, b) => (isSorted ? a.requestId - b.requestId : b.requestId - a.requestId))
    );
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchDepartment("");
    setSearchWorkstation("");
    fetchRequests();
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px" }}>
      <h2 className={styles.title} style={{ fontSize: "18px", marginBottom: "10px" }}>Hardware Requests</h2>

      {/* Search Filters */}
      {userRole === "RequestManager" && (
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
        <Button variant="outline" onClick={handleClearSearch} style={{ flex: "none" }}>Clear</Button>
      </div>)}

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
              <th style={{ padding: "6px", whiteSpace: "nowrap" }}>Serial Id</th>
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
                <td style={{ padding: "6px", whiteSpace: "nowrap" }}>{request.serialNo}</td>
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

    {/* Pagination and Sort Button */}
    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
  <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" />
  <Button onClick={handleSort} size="sm" variant="outline">
    {isSorted ? "Sort Oldest First" : "Sort Newest First"}
  </Button>
</div>

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
          {userRole === "RequestManager" && (
            <TextInput label="SerialId" value={formData.serialNo} onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })} required />
          )}
          <Button type="submit" style={{ marginTop: "10px" }}>{editModalOpen ? "Update" : "Submit"}</Button>
        </form>
      </Modal>

    </div>
  );
};

export default SRRFFormForUser;