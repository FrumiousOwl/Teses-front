import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./Anomaly.module.css"; // Import your CSS module

type AnomalyLog = {
  id: number;
  email: string;
  role: string;
  entity: string;
  action: string;
  isAnomaly: boolean;
  timestamp: string;
};

const Anomaly: React.FC = () => {
  const [, setLogs] = useState<AnomalyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AnomalyLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none"); // Sort order for IsAnomaly
  const itemsPerPage = 10;

  const api = useApi();

  const fetchAnomalyLogs = useCallback(async () => {
    try {
      const url = `https://localhost:7234/api/anomalyDetector/logs`;
      const data = await api.get<AnomalyLog[]>(url);

      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Error fetching anomaly logs:", error);
    }
  }, [api]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAnomalyLogs();
    } else {
      window.location.href = "/login";
    }
  }, [fetchAnomalyLogs]);

  // Toggle sort order for IsAnomaly
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
  };

  // Sort logs based on the current sort order for IsAnomaly
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.isAnomaly === b.isAnomaly ? 0 : a.isAnomaly ? -1 : 1;
    } else if (sortOrder === "desc") {
      return a.isAnomaly === b.isAnomaly ? 0 : a.isAnomaly ? 1 : -1;
    } else {
      return 0; // No sorting
    }
  });

  // Format timestamp to YYYY-MM-DD HH:MM:SS
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.wrapper} style={{ maxWidth: "100%", padding: "10px" }}>
      <div style={{ overflowX: "auto", marginBottom: "20px" }}>
        <Table
          className={styles.table}
          style={{ fontSize: "12px", marginBottom: "10px", minWidth: "1100px" }}
        >
          <thead>
            <tr>
              <th style={{ padding: "4px" }}>ID</th>
              <th style={{ padding: "4px" }}>Email</th>
              <th style={{ padding: "4px" }}>Role</th>
              <th style={{ padding: "4px" }}>Entity</th>
              <th style={{ padding: "4px" }}>Action</th>
              <th style={{ padding: "4px" }}>IsAnomaly</th>
              <th style={{ padding: "4px" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ padding: "4px" }}>{log.id}</td>
                <td style={{ padding: "4px" }}>{log.email}</td>
                <td style={{ padding: "4px" }}>{log.role}</td>
                <td style={{ padding: "4px" }}>{log.entity}</td>
                <td style={{ padding: "4px" }}>{log.action}</td>
                <td style={{ padding: "4px" }} className={log.isAnomaly ? styles.anomalyText : ""}>
                  {log.isAnomaly.toString()}
                </td>
                <td style={{ padding: "4px" }}>{formatTimestamp(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={setCurrentPage}
          size="sm"
        />
        <Button
          onClick={toggleSortOrder}
          size="sm"
          variant="filled" // Changed to "filled" for better visibility
          style={{ marginLeft: "10px", backgroundColor: "#228be6", color: "white" }} // Added background color and text color
        >
          Sort by Anomaly {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : "↕"}
        </Button>
      </div>
    </div>
  );
};

export default Anomaly;