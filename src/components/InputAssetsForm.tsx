import React, { useState, useEffect, useCallback } from "react";
import { TextInput, Button, Table, Modal, Pagination, Tooltip } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useApi } from "../service/apiService";
import { useNavigate } from "react-router-dom";
import styles from "./InputAssetsForm.module.css";

type Hardware = {
  hardwareId: number;
  name: string;
  description: string;
  datePurchased: string;
  defective: number;
  available: number;
  deployed: number;
  supplier: string;
  totalPrice: string;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });
};

const InputAssetsForm: React.FC = () => {
  const navigate = useNavigate();
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
    datePurchased: new Date().toISOString().split("T")[0],
    defective: 0,
    available: 0,
    deployed: 0,
    supplier: "",
    totalPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [lowStockItems, setLowStockItems] = useState<Hardware[]>([]); // State to track low stock items
  const [userRole, setUserRole] = useState<string | null>(null); // Add state for user role

  const api = useApi();

  // Fetch the user role from the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
        const role = decodedToken.role; // Extract the role from the token
        setUserRole(role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.get<Hardware[]>("/Hardware");
      setAssets(data);
      setFilteredAssets(data);
      checkLowStockItems(data); // Check for low stock items whenever assets are fetched
    } catch (error) {
      console.error("Error fetching hardware:", error);
    }
  }, [api]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAssets();
    } else {
      window.location.href = '/login';
    }
  }, [fetchAssets]);

  const checkLowStockItems = (assets: Hardware[]) => {
    const lowStock = assets.filter(asset => asset.available <= 10);
    setLowStockItems(lowStock);
  };

  const handleSearch = () => {
    const filtered = assets.filter((asset) => {
      const matchesName = asset.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDate = asset.datePurchased.includes(searchDate);
      const matchesSupplier = asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase());

      return matchesName && matchesDate && matchesSupplier;
    });
    setFilteredAssets(filtered);
    setCurrentPage(1);
  };

  const handleEditClick = (asset: Hardware) => {
    setCurrentEditAsset(asset);
    setFormData(asset);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (hardwareId: number) => {
    setAssetToDelete(hardwareId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        await api.delete(`/Hardware/${assetToDelete}`);
        fetchAssets();
      } catch (error) {
        console.error("Error deleting hardware:", error);
      } finally {
        setDeleteModalOpen(false);
        setAssetToDelete(null);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedFormData = { ...formData };

      const deployedDifference = updatedFormData.deployed - (currentEditAsset?.deployed || 0);
      const defectiveDifference = updatedFormData.defective - (currentEditAsset?.defective || 0);

      updatedFormData.available = updatedFormData.available - deployedDifference;
      updatedFormData.deployed = updatedFormData.deployed - defectiveDifference;

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

  const handleAddClick = () => {
    setFormData({
      hardwareId: 0,
      name: "",
      description: "",
      datePurchased: new Date().toISOString().split("T")[0],
      defective: 0,
      available: 0,
      deployed: 0,
      supplier: "",
      totalPrice: "",
    });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      if (formData.deployed > formData.available) {
        formData.deployed = formData.available;
      }

      if (formData.defective > formData.deployed) {
        formData.defective = formData.deployed;
      }

      formData.available = formData.available - formData.deployed;
      formData.deployed = formData.deployed - formData.defective;

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

  const handleIncrement = (field: keyof Hardware) => {
    setFormData((prev) => {
      const newValue = (prev[field] as number) + 1;

      if (field === "deployed" && newValue > prev.available) {
        return prev;
      }
      if (field === "defective" && newValue > prev.deployed) {
        return prev;
      }

      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  const handleDecrement = (field: keyof Hardware) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] as number) - 1),
    }));
  };

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px", position: "relative" }}>
      {/* Warning Icon at the top right with Tooltip */}
      {lowStockItems.length > 0 && (
        <Tooltip
          label="Warning! Some items are running low on stock"
          position="bottom"
          withArrow
          styles={{
            tooltip: {
              backgroundColor: "red",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            },
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
              zIndex: 1000,
            }}
            onClick={() => navigate("/dashboard/warning-stock")}
          >
            <IconExclamationCircle size={24} color="red" />
          </div>
        </Tooltip>
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

      {/* Add Asset Button (Conditional Rendering) */}
      {userRole === "InventoryManager" && (
        <Button className={styles.addButton} onClick={handleAddClick} style={{ marginBottom: "10px" }}>
          Add Asset
        </Button>
      )}

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
            <th style={{ padding: "4px" }}>Supplier</th>
            <th style={{padding: "4px"}}>Total Price</th>
            <th style={{ padding: "4px" }}>Defective</th>
            <th style={{ padding: "4px" }}>Available</th>
            <th style={{ padding: "4px" }}>Deployed</th>
            <th style={{ padding: "4px" }}>Total Items</th>
            {/* Conditionally render the Actions column header */}
            {userRole === "InventoryManager" && (
              <th style={{ padding: "4px" }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.map((hardware, index) => (
            <tr key={hardware.hardwareId}>
              <td style={{ padding: "4px" }}>{index + 1}</td>
              <td style={{ padding: "4px" }}>{hardware.hardwareId}</td>
              <td style={{ padding: "4px" }}>{hardware.name}</td>
              <td style={{ padding: "4px" }}>{hardware.description}</td>
              <td style={{ padding: "4px" }}>{formatDate(hardware.datePurchased)}</td>
              <td style={{ padding: "4px" }}>{hardware.supplier}</td>
              <td style={{ padding: "4px" }}>₱ {hardware.totalPrice.toLocaleString()}</td>
              <td style={{ padding: "4px" }}>{hardware.defective}</td>
              <td style={{ padding: "4px" }}>{hardware.available}</td>
              <td style={{ padding: "4px" }}>{hardware.deployed}</td>
              {/* Conditionally render the Actions column cells */}
              {userRole === "InventoryManager" && (
                <td style={{ padding: "4px" }} className={styles.actionButtons}>
                  <Button size="xs" onClick={() => handleEditClick(hardware)}>
                    Edit
                  </Button>
                  <Button size="xs" color="red" onClick={() => handleDeleteClick(hardware.hardwareId)}>
                    Delete
                  </Button>
                </td>
              )}
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
      {userRole === "InventoryManager" && (
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
            <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
            <TextInput label="Total Price" value={formData.totalPrice} onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })} required />
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
            <Button onClick={handleSaveEdit}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Add Asset Modal */}
      {userRole === "InventoryManager" && (
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
            <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
            <TextInput label="Total Price" value={formData.totalPrice} onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })} required />
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
            <Button onClick={handleSaveAdd}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {userRole === "InventoryManager" && (
        <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" size="sm">
          <p>Are you sure you want to delete this asset?</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red" onClick={confirmDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InputAssetsForm;