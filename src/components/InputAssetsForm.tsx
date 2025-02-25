import React, { useState, useEffect } from "react";
import { TextInput, Button, Table, Modal, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
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

  const [formData, setFormData] = useState<Hardware>({
    hardwareId: 0,
    name: "",
    description: "",
    datePurchased: new Date().toISOString().split("T")[0],
    defective: 0,
    available: 0,
    deployed: 0,
    supplier: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const api = useApi();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const data = await api.get<Hardware[]>("/Hardware");
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error("Error fetching hardware:", error);
    }
  };

  const handleSearch = () => {
    const filtered = assets.filter((asset) => {
      return (
        asset.name.toLowerCase().includes(searchName.toLowerCase()) &&
        asset.datePurchased.includes(searchDate) &&
        asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase())
      );
    });
    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  const handleEditClick = (asset: Hardware) => {
    setCurrentEditAsset(asset);
    setFormData(asset);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (hardwareId: number) => {
    try {
      await api.delete(`/Hardware/${hardwareId}`);
      fetchAssets();
    } catch (error) {
      console.error("Error deleting hardware:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/Hardware/${formData.hardwareId}`, formData);
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
    });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      await api.post("/Hardware", formData);
      setAddModalOpen(false);
      fetchAssets();
    } catch (error) {
      console.error("Error adding hardware:", error);
    }
  };

  // Calculate the total number of pages based on the filtered assets
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Slice the filtered assets to display only the items for the current page
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h2 className={styles.title}>Asset Management</h2>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
        <TextInput
          placeholder="Search Date Purchased"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className={styles.searchInput}
        />
        <TextInput
          placeholder="Search Supplier"
          value={searchSupplier}
          onChange={(e) => setSearchSupplier(e.target.value)}
          className={styles.searchInput}
        />
        <Button className={styles.searchButton} onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* ➕ Add Asset Button */}
      <Button className={styles.addButton} onClick={handleAddClick}>
        Add Asset
      </Button>

      {/* 📋 Table of Assets with Action Buttons */}
      <Table className={styles.table} style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Date Purchased</th>
            <th>Defective</th>
            <th>Available</th>
            <th>Deployed</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.map((hardware) => (
            <tr key={hardware.hardwareId}>
              <td>{hardware.hardwareId}</td>
              <td>{hardware.name}</td>
              <td>{hardware.description}</td>
              <td>{hardware.datePurchased}</td>
              <td>{hardware.defective}</td>
              <td>{hardware.available}</td>
              <td>{hardware.deployed}</td>
              <td>{hardware.supplier}</td>
              <td className={styles.actionButtons}>
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
        style={{ marginTop: "20px" }}
      />

      {/* 📝 Edit Asset Modal */}
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Asset">
        <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <TextInput label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        <TextInput label="Date Purchased" type="date" value={formData.datePurchased} onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })} required />
        <TextInput label="Defective" type="number" value={formData.defective} onChange={(e) => setFormData({ ...formData, defective: Number(e.target.value) || 0 })} />
        <TextInput label="Available" type="number" value={formData.available} onChange={(e) => setFormData({ ...formData, available: Number(e.target.value) || 0 })} />
        <TextInput label="Deployed" type="number" value={formData.deployed} onChange={(e) => setFormData({ ...formData, deployed: Number(e.target.value) || 0 })} />
        <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
        <Button onClick={handleSaveEdit}>Save</Button>
      </Modal>

      {/* ➕ Add Asset Modal */}
      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Asset">
        <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <TextInput label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        <TextInput label="Date Purchased" type="date" value={formData.datePurchased} onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })} required />
        <TextInput label="Defective" type="number" value={formData.defective} onChange={(e) => setFormData({ ...formData, defective: Number(e.target.value) || 0 })} />
        <TextInput label="Available" type="number" value={formData.available} onChange={(e) => setFormData({ ...formData, available: Number(e.target.value) || 0 })} />
        <TextInput label="Deployed" type="number" value={formData.deployed} onChange={(e) => setFormData({ ...formData, deployed: Number(e.target.value) || 0 })} />
        <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
        <Button onClick={handleSaveAdd}>Save</Button>
      </Modal>
    </div>
  );
};

export default InputAssetsForm;