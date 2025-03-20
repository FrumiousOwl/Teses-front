/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination, Button } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./DefectiveAssetsForm.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  datePurchased: string;
  defective: number;
  supplier: string;
};

const ITEMS_PER_PAGE = 10;

const DefectiveAssetsForm: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchSupplier, setSearchSupplier] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch defective assets when component mounts
  useEffect(() => {
    fetchDefectiveAssets();
    fetchUserRole();
  }, []);

  const fetchDefectiveAssets = async () => {
    try {
      const data = await api.get<Asset[]>("https://localhost:7234/api/Hardware/defective/getAllDefectiveHardware");
      setAllAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error("Error fetching defective hardware:", error);
    }
  };

  // Fetch user role from token
  const fetchUserRole = () => {
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
  };

  // Handle search filtering automatically as the user types
  useEffect(() => {
    const searched = allAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchName.toLowerCase()) &&
        asset.datePurchased.includes(searchDate) &&
        asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase())
    );
    setFilteredAssets(searched);
    setActivePage(1); // Reset to the first page when search criteria change
  }, [allAssets, searchName, searchDate, searchSupplier]);

  // Format date to "M/D/YYYY, h:mm:ss A"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Clear search fields
  const handleClearSearch = () => {
    setSearchName("");
    setSearchDate("");
    setSearchSupplier("");
  };

  // Paginate assets
  const paginatedAssets = filteredAssets.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h3 className={styles.title}>Defective Hardware</h3>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          type="date"
          placeholder="Search by date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Supplier"
          value={searchSupplier}
          onChange={(e) => setSearchSupplier(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <Button onClick={handleClearSearch} style={{ flex: "none" }}>Clear</Button>
      </div>

      {/* 📋 Table of Defective Assets */}
      <Table className={styles.table} style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th>Index</th>
            <th>Harware ID</th>
            <th>Name</th>
            <th>Date Purchased</th>
            <th>Defective</th>
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
                <td>{formatDate(asset.datePurchased)}</td>
                <td>{asset.defective}</td>
                <td>{userRole === "InventoryManager" ? asset.supplier : "NaN"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>No defective hardware found.</td>
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

export default DefectiveAssetsForm;