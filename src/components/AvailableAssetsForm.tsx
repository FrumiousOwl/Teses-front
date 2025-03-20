/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination, Button, Tooltip } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
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

const ITEMS_PER_PAGE = 10;

const AvailableAssetsForm: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [inputAssets, setInputAssets] = useState<string[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchSupplier, setSearchSupplier] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Asset[]>([]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchAssets();
    fetchInputAssets();
    fetchUserRole();
  }, []);

  // Fetch available assets
  const fetchAssets = async () => {
    try {
      const data = await api.get<Asset[]>("https://localhost:7234/api/Hardware/available/getAllAvailableHardware");
      setAllAssets(data);
      setFilteredAssets(data); // Initialize filteredAssets with all assets
      checkLowStockItems(data); // Check for low stock items
    } catch (error) {
      console.error("Error fetching available hardware:", error);
    }
  };

  // Fetch input assets (AIDs only)
  const fetchInputAssets = async () => {
    try {
      const data = await api.get<{ hardwareId: string }[]>("https://localhost:7234/api/Hardware");
      setInputAssets(data.map((asset) => asset.hardwareId));
    } catch (error) {
      console.error("Error fetching input assets:", error);
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

  // Check for low stock items
  const checkLowStockItems = (assets: Asset[]) => {
    const lowStock = assets.filter((asset) => asset.available <= 10);
    setLowStockItems(lowStock);
  };

  // Handle search filtering automatically as the user types
  useEffect(() => {
    const filtered = allAssets.filter((asset) => {
      // Exclude assets that are in inputAssets
      if (inputAssets.includes(asset.hardwareId.toString())) {
        return false;
      }

      // Apply search filters
      const matchesName = asset.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDate = asset.datePurchased.includes(searchDate);
      const matchesSupplier = asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase());

      // Return true only if all search criteria are met
      return matchesName && matchesDate && matchesSupplier;
    });

    setFilteredAssets(filtered);
    setActivePage(1); // Reset to the first page when search criteria change
  }, [allAssets, inputAssets, searchName, searchDate, searchSupplier]);

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
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px", position: "relative" }}>
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
          >
            <IconExclamationCircle size={24} color="red" />
          </div>
        </Tooltip>
      )}

      <h3 className={styles.title}>Available Hardware</h3>

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
                <td>{formatDate(asset.datePurchased)}</td>
                <td>{asset.available}</td>
                <td>{asset.deployed}</td>
                <td>{userRole === "InventoryManager" ? asset.supplier : "NaN"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>No available hardware found.</td>
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