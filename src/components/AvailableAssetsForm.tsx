import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination, Button } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./AvailableAssetsForm.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  datePurchased: string; // Assuming this is a string in ISO format
  deployed: number;
  available: number;
  supplier: string;
};

const ITEMS_PER_PAGE = 10; // Updated to 10 items per page

const AvailableAssetsForm: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [inputAssets, setInputAssets] = useState<string[]>([]); // Stores AIDs of input assets
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchSupplier, setSearchSupplier] = useState<string>("");

  // Fetch data when component mounts
  useEffect(() => {
    fetchAssets();
    fetchInputAssets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available assets
  async function fetchAssets() {
    try {
      const data = await api.get<Asset[]>("https://localhost:7234/api/Hardware/available/getAllAvailableHardware");
      setAllAssets(data);
      setFilteredAssets(data); // Reset filteredAssets to show all assets
    } catch (error) {
      console.error("Error fetching available hardware:", error);
    }
  }

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

  // Handle search when the search button is clicked
  const handleSearch = () => {
    const searched = allAssets.filter(
      (asset) =>
        !inputAssets.includes(asset.hardwareId.toString()) && // Exclude input assets
        (asset.name.toLowerCase().includes(searchName.toLowerCase())) && // Search by name
        (asset.datePurchased.includes(searchDate)) && // Search by date
        (asset.supplier.toLowerCase().includes(searchSupplier.toLowerCase())) // Search by supplier
    );
    setFilteredAssets(searched);
    setActivePage(1); // Reset to the first page when search criteria change
  };

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

  // Clear search fields and reset the table to show all assets
  const handleClearSearch = () => {
    setSearchName("");
    setSearchDate("");
    setSearchSupplier("");
    fetchAssets(); // Reset the table to show all assets
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
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        <TextInput
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="mm/dd/yyyy"
          value={searchDate}
          onChange={(e) => setSearchDate(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <TextInput
          placeholder="Search Supplier"
          value={searchSupplier}
          onChange={(e) => setSearchSupplier(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "150px" }}
        />
        <Button onClick={handleSearch} style={{ flex: "none" }}>Search</Button> {/* Search button */}
        <Button onClick={handleClearSearch} style={{ flex: "none" }}>Clear</Button> {/* Clear button */}
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
                <td>{formatDate(asset.datePurchased)}</td> {/* Format the date here */}
                <td>{asset.available}</td>
                <td>{asset.deployed}</td>
                <td>{asset.supplier}</td>
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
        total={Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)} // Calculate total pages based on ITEMS_PER_PAGE
        value={activePage}
        onChange={setActivePage}
        className={styles.pagination}
        mt="md"
      />
    </div>
  );
};

export default AvailableAssetsForm;