/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./WarningStock.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  available: number;
};

const ITEMS_PER_PAGE = 3;

const WarningStock: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch data when component mounts
  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch available assets
  const fetchAssets = async () => {
    try {
      const data = await api.get<Asset[]>("https://localhost:7234/api/Hardware/available/getAllAvailableHardware");
      setAllAssets(data);
    } catch (error) {
      console.error("Error fetching available hardware:", error);
    }
  };

  // Filter low stock assets (available <= 10)
  useEffect(() => {
    const lowStockAssets = allAssets.filter((asset) => asset.available <= 10);
    setFilteredAssets(lowStockAssets);
  }, [allAssets]);

  // Handle search filtering
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searched = allAssets.filter(
      (asset) =>
        asset.available <= 10 && // Ensure only low stock assets are included
        (
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.hardwareId.toString().includes(query)
        )
    );
    setFilteredAssets(searched);
    setActivePage(1);
  };

  // Paginate assets
  const paginatedAssets = filteredAssets.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h3 className={styles.title}>Warning Low Stock </h3>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <TextInput
          className={styles.searchInput}
          placeholder="Search by name or ID"
          value={searchQuery}
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />
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