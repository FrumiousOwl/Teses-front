/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Button, Table, Modal, Pagination, Alert, Group, ActionIcon } from "@mantine/core";
import { IconAlertCircle, IconX, IconInfoCircle } from "@tabler/icons-react"; // Import icons from Tabler Icons
import { useApi } from "../service/apiService";
import styles from "./InputAssetsForm.module.css";

type Hardware = {
  hardwareId: number;
  name: string;
  description: string;
  datePurchased: string; // Ensure this is in "YYYY-MM-DD" format
  defective: number;
  available: number;
  deployed: number;
  supplier: string;
};

const InputAssetsForm: React.FC = () => {
  const [assets, setAssets] = useState<Hardware[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Hardware[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentEditAsset, setCurrentEditAsset] = useState<Hardware | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState<Hardware>({
    hardwareId: 0,
    name: "",
    description: "",
    datePurchased: new Date().toISOString().split("T")[0], // Default to today's date in "YYYY-MM-DD" format
    defective: 0,
    available: 0,
    deployed: 0,
    supplier: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isWarningVisible, setIsWarningVisible] = useState(true); // State to control warning visibility
  const [isWarningMinimized, setIsWarningMinimized] = useState(false); // State to control warning minimization

  const api = useApi();

  // Fetch assets function wrapped in useCallback
  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.get<Hardware[]>("/Hardware");
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error("Error fetching hardware:", error);
    }
  }, [api]);

  // Check authentication and fetch assets on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAssets();
    } else {
      // Redirect to login page if not authenticated
      window.location.href = '/login'; // Adjust the path as needed
    }
  }, [fetchAssets]);

  // Handle search functionality
  const handleSearch = () => {
    const filtered = assets.filter((asset) => {
      const matchesName = asset.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDate = asset.datePurchased.includes(searchDate); // Exact match for date
      const matchesSupplier = asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase());

      return matchesName && matchesDate && matchesSupplier;
    });
    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  // Handle edit click
  const handleEditClick = (asset: Hardware) => {
    setCurrentEditAsset(asset);
    setFormData(asset);
    setEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (hardwareId: number) => {
    setAssetToDelete(hardwareId);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        await api.delete(`/Hardware/${assetToDelete}`);
        fetchAssets(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting hardware:", error);
      } finally {
        setDeleteModalOpen(false);
        setAssetToDelete(null);
      }
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const updatedFormData = { ...formData };

      // Calculate the difference in deployed and defective counts
      const deployedDifference = updatedFormData.deployed - (currentEditAsset?.deployed || 0);
      const defectiveDifference = updatedFormData.defective - (currentEditAsset?.defective || 0);

      // Update available count based on deployed difference
      updatedFormData.available = updatedFormData.available - deployedDifference;

      // Update deployed count based on defective difference
      updatedFormData.deployed = updatedFormData.deployed - defectiveDifference;

      // Ensure counts are not negative
      if (updatedFormData.available < 0) updatedFormData.available = 0;
      if (updatedFormData.deployed < 0) updatedFormData.deployed = 0;
      if (updatedFormData.defective < 0) updatedFormData.defective = 0;

      await api.put(`/Hardware/${formData.hardwareId}`, updatedFormData);
      setEditModalOpen(false);
      fetchAssets();
    } catch (error) {
      console.error("Error updating hardware:", error);
    }
  };

  // Handle add click
  const handleAddClick = () => {
    setFormData({
      hardwareId: 0,
      name: "",
      description: "",
      datePurchased: new Date().toISOString().split("T")[0], // Default to today's date in "YYYY-MM-DD" format
      defective: 0,
      available: 0,
      deployed: 0,
      supplier: "",
    });
    setAddModalOpen(true);
  };

  // Handle save add
  const handleSaveAdd = async () => {
    try {
      // Ensure deployed does not exceed available
      if (formData.deployed > formData.available) {
        formData.deployed = formData.available;
      }

      // Ensure defective does not exceed deployed
      if (formData.defective > formData.deployed) {
        formData.defective = formData.deployed;
      }

      // Update available count based on deployed
      formData.available = formData.available - formData.deployed;

      // Update deployed count based on defective
      formData.deployed = formData.deployed - formData.defective;

      // Ensure counts are not negative
      if (formData.available < 0) formData.available = 0;
      if (formData.deployed < 0) formData.deployed = 0;
      if (formData.defective < 0) formData.defective = 0;

      await api.post("/Hardware", formData);
      setAddModalOpen(false);
      fetchAssets();
    } catch (error) {
      console.error("Error adding hardware:", error);
    }
  };

  // Handle increment for form fields
  const handleIncrement = (field: keyof Hardware) => {
    setFormData((prev) => {
      const newValue = (prev[field] as number) + 1;

      // Apply limits based on the field
      if (field === "deployed" && newValue > prev.available) {
        return prev; // Do not exceed available count
      }
      if (field === "defective" && newValue > prev.deployed) {
        return prev; // Do not exceed deployed count
      }

      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  // Handle decrement for form fields
  const handleDecrement = (field: keyof Hardware) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] as number) - 1),
    }));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Check for low stock (10 or fewer items remaining)
  const lowStockAssets = assets.filter((asset) => asset.available <= 10);

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px" }}>
      <h2 className={styles.title} style={{ fontSize: "18px", marginBottom: "10px" }}>Hardware Management</h2>

      {/* Low Stock Warning */}
      {lowStockAssets.length > 0 && (
        isWarningMinimized ? (
          <ActionIcon
            size="sm"
            color="red"
            onClick={() => setIsWarningMinimized(false)} // Expand button
            style={{ marginBottom: "10px" }}
          >
            <IconInfoCircle size={18} />
          </ActionIcon>
        ) : (
          <Alert
            title={
              <Group align="center" justify="space-between">
            <Group>
              <IconAlertCircle size={18} /> {/* Warning icon */}
               <span>Low Stock Warning</span>
                </Group>
             <ActionIcon
            size="sm"
            color="red"
    onClick={() => setIsWarningMinimized(true)} // Minimize button
  >
    <IconX size={14} />
  </ActionIcon>
</Group>
            }
            color="red"
            style={{ marginBottom: "10px" }}
          >
            The following assets are running low:
            <ul>
              {lowStockAssets.map((asset) => (
                <li key={asset.hardwareId}>
                  {asset.name} - {asset.available} items remaining
                </li>
              ))}
            </ul>
          </Alert>
        )
      )}

      {/* Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Date Purchased"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Supplier"
          value={searchSupplier}
          onChange={(e) => setSearchSupplier(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <Button className={styles.searchButton} onClick={handleSearch} style={{ flex: "none" }}>
          Search
        </Button>
      </div>

      {/* Add Asset Button */}
      <Button className={styles.addButton} onClick={handleAddClick} style={{ marginBottom: "10px" }}>
        Add Asset
      </Button>

      {/* Table of Assets */}
      <div style={{ overflowX: "auto", marginBottom: "20px" }}></div>
      <Table className={styles.table} style={{ fontSize: "12px", marginBottom: "10px", minWidth: "1100px"  }}>
        <thead>
          <tr>
            <th style={{ padding: "4px" }}>Index</th>
            <th style={{ padding: "4px" }}>ID</th>
            <th style={{ padding: "4px" }}>Name</th>
            <th style={{ padding: "4px" }}>Description</th>
            <th style={{ padding: "4px" }}>Date Purchased</th>
            <th style={{ padding: "4px" }}>Defective</th>
            <th style={{ padding: "4px" }}>Available</th>
            <th style={{ padding: "4px" }}>Deployed</th>
            <th style={{ padding: "4px" }}>Supplier</th>
            <th style={{ padding: "4px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.map((hardware, index) => (
            <tr key={hardware.hardwareId}>
              <td style={{ padding: "4px" }}>{index + 1}</td>
              <td style={{ padding: "4px" }}>{hardware.hardwareId}</td>
              <td style={{ padding: "4px" }}>{hardware.name}</td>
              <td style={{ padding: "4px" }}>{hardware.description}</td>
              <td style={{ padding: "4px" }}>{hardware.datePurchased}</td>
              <td style={{ padding: "4px" }}>{hardware.defective}</td>
              <td style={{ padding: "4px" }}>{hardware.available}</td>
              <td style={{ padding: "4px" }}>{hardware.deployed}</td>
              <td style={{ padding: "4px" }}>{hardware.supplier}</td>
              <td style={{ padding: "4px" }} className={styles.actionButtons}>
                <Button size="xs" onClick={() => handleEditClick(hardware)}>
                  Edit
                </Button>
                <Button size="xs" color="red" onClick={() => handleDeleteClick(hardware.hardwareId)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={setCurrentPage}
        size="sm"
        style={{ marginBottom: "10px" }}
      />

      {/* Edit Asset Modal */}
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Asset" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <TextInput
            label="Date Purchased"
            type="date"
            value={formData.datePurchased}
            onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })}
            required
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextInput
              label="Defective"
              type="number"
              value={formData.defective}
              onChange={(e) => {
                const defective = Math.min(formData.deployed, Number(e.target.value) || 0);
                setFormData({ ...formData, defective });
              }}
              style={{ flex: 1 }}
            />
            <Button onClick={() => handleDecrement("defective")} style={{ marginTop: "24px" }}>-</Button>
            <Button onClick={() => handleIncrement("defective")} style={{ marginTop: "24px" }}>+</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextInput
              label="Available"
              type="number"
              value={formData.available}
              onChange={(e) => {
                const available = Number(e.target.value) || 0;
                setFormData({ ...formData, available });
              }}
              style={{ flex: 1 }}
            />
            <Button onClick={() => handleDecrement("available")} style={{ marginTop: "24px" }}>-</Button>
            <Button onClick={() => handleIncrement("available")} style={{ marginTop: "24px" }}>+</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextInput
              label="Deployed"
              type="number"
              value={formData.deployed}
              onChange={(e) => {
                const deployed = Math.min(formData.available, Number(e.target.value) || 0);
                setFormData({ ...formData, deployed });
              }}
              style={{ flex: 1 }}
            />
            <Button onClick={() => handleDecrement("deployed")} style={{ marginTop: "24px" }}>-</Button>
            <Button onClick={() => handleIncrement("deployed")} style={{ marginTop: "24px" }}>+</Button>
          </div>
          <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
          <Button onClick={handleSaveEdit}>Save</Button>
        </div>
      </Modal>

      {/* Add Asset Modal */}
      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Asset" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <TextInput
            label="Date Purchased"
            type="date"
            value={formData.datePurchased}
            onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })}
            required
          />
          <TextInput
            label="Defective"
            type="number"
            value={formData.defective}
            onChange={(e) => {
              const defective = Math.min(formData.deployed, Number(e.target.value) || 0);
              setFormData({ ...formData, defective });
            }}
          />
          <TextInput
            label="Available"
            type="number"
            value={formData.available}
            onChange={(e) => {
              const available = Number(e.target.value) || 0;
              setFormData({ ...formData, available });
            }}
          />
          <TextInput
            label="Deployed"
            type="number"
            value={formData.deployed}
            onChange={(e) => {
              const deployed = Math.min(formData.available, Number(e.target.value) || 0);
              setFormData({ ...formData, deployed });
            }}
          />
          <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
          <Button onClick={handleSaveAdd}>Save</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" size="sm">
        <p>Are you sure you want to delete this asset?</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default InputAssetsForm;