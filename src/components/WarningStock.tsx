/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination, Button } from "@mantine/core"; // Import Button from Mantine
import { useApi } from "../service/apiService";
import styles from "./WarningStock.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  available: number;
};

const ITEMS_PER_PAGE = 10;

const WarningStock: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchId, setSearchId] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");

  // Fetch data when component mounts
  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch available assets
  const fetchAssets = async () => {
    try {
      const data = await api.get<Asset[]>("http://localhost:5000/api/Hardware/available/getAllAvailableHardware");
      setAllAssets(data);
      // Initially filter low stock assets
      const lowStockAssets = data.filter((asset) => asset.available <= 10);
      setFilteredAssets(lowStockAssets);
    } catch (error) {
      console.error("Error fetching available hardware:", error);
    }
  };

  // Handle search filtering
  useEffect(() => {
    const searched = allAssets.filter(
      (asset) =>
        asset.available <= 10 && // Ensure only low stock assets are included
        asset.name.toLowerCase().includes(searchName.toLowerCase()) &&
        asset.hardwareId.toString().includes(searchId)
    );
    setFilteredAssets(searched);
    setActivePage(1); // Reset to the first page when search criteria change
  }, [allAssets, searchId, searchName]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchId("");
    setSearchName("");
    const lowStockAssets = allAssets.filter((asset) => asset.available <= 10);
    setFilteredAssets(lowStockAssets);
    setActivePage(1);
  };

  // Paginate assets
  const paginatedAssets = filteredAssets.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h3 className={styles.title}>Warning Low Stock</h3>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search ID"
          value={searchId}
          onChange={(e) => setSearchId(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <Button
          onClick={handleClearSearch}
          color="blue" // Set the button color to blue
          style={{ flex: "none" }}
        >
          Clear
        </Button> {/* Clear button */}
      </div>

      {/* 📋 Table of Low Stock Assets */}
      <Table className={styles.table} style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.length > 0 ? (
            paginatedAssets.map((asset) => (
              <tr key={asset.hardwareId}>
                <td>{asset.hardwareId}</td>
                <td>{asset.name}</td>
                <td>{asset.available}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>No low stock assets found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination
        total={Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)}
        value={activePage}
        onChange={setActivePage}
        className={styles.pagination}
        mt="md"
      />
    </div>
  );
};

export default WarningStock;