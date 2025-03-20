import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Pagination } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./Anomaly.module.css"; // Import the enhanced CSS

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const itemsPerPage = 10;

  const api = useApi();

  const fetchAnomalyLogs = useCallback(async () => {
    try {
      const url = `http://localhost:5000/api/anomalyDetector/logs`;
      const data = await api.get<AnomalyLog[]>(url);``

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

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
  };

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.isAnomaly === b.isAnomaly ? 0 : a.isAnomaly ? -1 : 1;
    } else if (sortOrder === "desc") {
      return a.isAnomaly === b.isAnomaly ? 0 : a.isAnomaly ? 1 : -1;
    } else {
      return 0; // No sorting
    }
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
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
    <div className={styles.wrapper}>
      <div className={styles.tableWrapper}>
        <Table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Entity</th>
              <th>Action</th>
              <th>IsAnomaly</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.email}</td>
                <td>{log.role}</td>
                <td>{log.entity}</td>
                <td>{log.action}</td>
                <td className={log.isAnomaly ? styles.anomalyText : ""}>
                  {log.isAnomaly.toString()}
                </td>
                <td>{formatTimestamp(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className={styles.paginationContainer}>
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={setCurrentPage}
          size="sm"
        />
        <Button
          onClick={toggleSortOrder}
          className={styles.sortButton}
        >
          Sort by Anomaly {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : "↕"}
        </Button>
      </div>
    </div>
  );
};

export default Anomaly;