import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./AvailableAssetsForm.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  datePurchased: string;
  deployed: number;
  available: number;
  supplier: string;
};

const ITEMS_PER_PAGE = 3;

const AvailableAssetsForm: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [inputAssets, setInputAssets] = useState<string[]>([]); // Stores AIDs of input assets
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch data when component mounts
  useEffect(() => {
    fetchAssets();
    fetchInputAssets();
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

  // Fetch input assets (AIDs only)
  const fetchInputAssets = async () => {
    try {
      const data = await api.get<{ hardwareId: string }[]>("https://localhost:7234/api/Hardware");
      console.log("Fetched Input Assets:", data); // Debugging
      setInputAssets(data.map((asset) => asset.hardwareId));
    } catch (error) {
      console.error("Error fetching input assets:", error);
    }
  };

  // Filter available assets by excluding those in InputAssets
  useEffect(() => {
    const filtered = allAssets.filter((asset) => !inputAssets.includes(asset.hardwareId.toString()));
    setFilteredAssets(filtered);
  }, [allAssets, inputAssets]);

  // Handle search filtering
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searched = allAssets.filter(
      (asset) =>
        !inputAssets.includes(asset.hardwareId.toString()) &&
        (
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.datePurchased.includes(query)
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
      <h3 className={styles.title}>Available Hardware</h3>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <TextInput
          className={styles.searchInput}
          placeholder="Search by name, or date of purchase"
          value={searchQuery}
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>

      {/* 📋 Table of Available Assets */}
      <Table className={styles.table} style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th>Index</th>
            <th>Hardware Id</th>
            <th>Name</th>
            <th>Date Purchased</th>
            <th>Available</th>
            <th>Deployed</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.length > 0 ? (
            paginatedAssets.map((asset, index) => (
              <tr key={asset.hardwareId}>
                <td>{index + 1}</td>
                <td>{asset.hardwareId}</td>
                <td>{asset.name}</td>
                <td>{asset.datePurchased}</td>
                <td>{asset.available}</td>
                <td>{asset.deployed}</td>
                <td>{asset.supplier}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>No available hardware found.</td>
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

export default AvailableAssetsForm;