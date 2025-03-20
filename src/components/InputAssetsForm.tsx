import React, { useState, useEffect, useCallback, useMemo } from "react";
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

type SearchQuery = {
  name: string;
  supplier: string;
  date: string;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
};

const formatMoney = (value: string): string => {
  const rawValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat().format(Number(rawValue));
};

const parseMoney = (formattedValue: string): string => {
  return formattedValue.replace(/,/g, "");
};

const InputAssetsForm: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Hardware[]>([]);
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
  const [lowStockItems, setLowStockItems] = useState<Hardware[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    name: "",
    supplier: "",
    date: "",
  });

  const api = useApi();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const role = decodedToken.role;
        setUserRole(role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.get<Hardware[]>("/Hardware");
      const sortedAssets = data.sort((a, b) => b.hardwareId - a.hardwareId);
      setAssets(sortedAssets);
      checkLowStockItems(sortedAssets);
    } catch (error) {
      console.error("Error fetching hardware:", error);
    }
  }, [api]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAssets();
    } else {
      window.location.href = "/login";
    }
  }, [fetchAssets]);

  const checkLowStockItems = (assets: Hardware[]) => {
    const lowStock = assets.filter((asset) => asset.available <= 10);
    setLowStockItems(lowStock);
  };

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (searchQuery.name) {
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(searchQuery.name.toLowerCase())
      );
    }

    if (searchQuery.supplier) {
      filtered = filtered.filter((asset) =>
        asset.supplier.toLowerCase().includes(searchQuery.supplier.toLowerCase())
      );
    }

    if (searchQuery.date) {
      filtered = filtered.filter((asset) =>
        asset.datePurchased.includes(searchQuery.date)
      );
    }

    return filtered;
  }, [assets, searchQuery]);

  const paginatedAssets = useMemo(() => {
    return filteredAssets.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAssets, currentPage]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const handleEditClick = (asset: Hardware) => {
    setCurrentEditAsset(asset);
    setFormData({
      ...asset,
      totalPrice: formatMoney(asset.totalPrice),
    });
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

      updatedFormData.totalPrice = parseMoney(updatedFormData.totalPrice);

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
      const rawTotalPrice = parseMoney(formData.totalPrice);
      const updatedFormData = { ...formData, totalPrice: rawTotalPrice };

      await api.post("/Hardware", updatedFormData);
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

  const handleClearSearch = () => {
    setSearchQuery({ name: "", supplier: "", date: "" });
  };

  const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatMoney(e.target.value);
    setFormData({ ...formData, totalPrice: formattedValue });
  };

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px", position: "relative" }}>
      {/* Warning Icon at the top right with Tooltip (Only for InventoryManager) */}
      {userRole === "InventoryManager" && lowStockItems.length > 0 && (
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

      {/* Add Asset Button (Conditional Rendering) */}
      {userRole === "InventoryManager" && (
        <Button className={styles.addButton} onClick={handleAddClick} style={{ marginBottom: "10px" }}>
          Add Asset
        </Button>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <TextInput
          placeholder="Search by name"
          value={searchQuery.name}
          onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
          style={{ flex: 1, minWidth: "200px" }}
        />
        <TextInput
          placeholder="Search by supplier"
          value={searchQuery.supplier}
          onChange={(e) => setSearchQuery({ ...searchQuery, supplier: e.target.value })}
          style={{ flex: 1, minWidth: "200px" }}
        />
        <TextInput
          type="date"
          placeholder="Search by date"
          value={searchQuery.date}
          onChange={(e) => setSearchQuery({ ...searchQuery, date: e.target.value })}
          style={{ flex: 1, minWidth: "200px" }}
        />
        <Button onClick={handleClearSearch} style={{ flex: "none" }}>Clear</Button>
      </div>

      {/* Table of Assets */}
      <div style={{ overflowX: "auto", marginBottom: "20px" }}>
        <Table className={styles.table} style={{ fontSize: "12px", marginBottom: "10px", minWidth: "1100px" }}>
          <thead>
            <tr>
              <th style={{ padding: "4px" }}>Index</th>
              <th style={{ padding: "4px" }}>ID</th>
              <th style={{ padding: "4px" }}>Name</th>
              <th style={{ padding: "4px" }}>Description</th>
              <th style={{ padding: "4px" }}>Date Purchased</th>
              <th style={{ padding: "4px" }}>Supplier</th>
              <th style={{ padding: "4px" }}>Total Price</th>
              <th style={{ padding: "4px" }}>Defective</th>
              <th style={{ padding: "4px" }}>Available</th>
              <th style={{ padding: "4px" }}>Deployed</th>
              {userRole === "InventoryManager" && <th style={{ padding: "4px" }}>Actions</th>}
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
                <td style={{ padding: "4px" }}>
                  {userRole === "InventoryManager" ? hardware.supplier : "NaN"}
                </td>
                <td style={{ padding: "4px" }}>₱ {new Intl.NumberFormat().format(Number(hardware.totalPrice))}</td>
                <td style={{ padding: "4px" }}>{hardware.defective}</td>
                <td style={{ padding: "4px" }}>{hardware.available}</td>
                <td style={{ padding: "4px" }}>{hardware.deployed}</td>
                {userRole === "InventoryManager" && (
                  <td style={{ padding: "4px" }} className={styles.actionButtons}>
                    <Button size="xs" onClick={() => handleEditClick(hardware)}>Edit</Button>
                    <Button size="xs" color="red" onClick={() => handleDeleteClick(hardware.hardwareId)}>Delete</Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

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
            <TextInput
              label="Total Price"
              value={formData.totalPrice}
              onChange={handleTotalPriceChange}
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
            <TextInput
              label="Total Price"
              value={formData.totalPrice}
              onChange={handleTotalPriceChange}
              required
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