/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./DefectiveAssetsForm.module.css";

type Asset = {
  hardwareId: number;
  name: string;
  datePurchased: string;
  defective: number;
  supplier: string;
};

const ITEMS_PER_PAGE = 3;

interface DefectiveAssetsFormProps {
  onSelectAsset: (asset: Asset) => void; 
}

const DefectiveAssetsForm: React.FC<DefectiveAssetsFormProps> = ({ onSelectAsset }) => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch defective assets when component mounts
  useEffect(() => {
    fetchDefectiveAssets();
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

  // Handle search filtering
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searched = allAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.datePurchased.includes(query)
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
      <h3 className={styles.title}>Defective Hardware</h3>

      {/* 🔍 Search Bar */}
      <div className={styles.searchContainer} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <TextInput
          className={styles.searchInput}
          placeholder="Search by name, or date of purchased"
          value={searchQuery}
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>

      {/* 📋 Table of Defective Assets */}
      <Table className={styles.table} style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th>Index</th>
            <th>ID</th>
            <th>Name</th>
            <th>Date of Purchase</th>
            <th>Defective</th>
            <th>Supplier</th>
            {/* Removed the "Action" column header */}
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
                <td>{asset.defective}</td>
                <td>{asset.supplier}</td>
                {/* Removed the "Select" button */}
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