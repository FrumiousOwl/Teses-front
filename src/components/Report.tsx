/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { TextInput, Table, Pagination, Button, Modal } from "@mantine/core";
import { useApi } from "../service/apiService";
import styles from "./Reports.module.css";
import jsPDF from "jspdf"; // Only jsPDF is needed

type HardwareRequest = {
  requestId: number;
  hardwareId: number | null;
  dateNeeded: string;
  name: string;
  department: string;
  workstation: string;
  problem: string;
  isFulfilled: boolean;
};

const ITEMS_PER_PAGE = 10;

const Report: React.FC = () => {
  const api = useApi();
  const [activePage, setActivePage] = useState<number>(1);
  const [allRequests, setAllRequests] = useState<HardwareRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HardwareRequest[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split("T")[0], // Today's date
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0], // End of current month
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch all hardware requests
  const fetchRequests = async () => {
    try {
      const data = await api.get<HardwareRequest[]>("/HardwareRequest");
      setAllRequests(data);
      setFilteredRequests(data); // Initialize filteredRequests with all data
    } catch (error) {
      console.error("Error fetching hardware requests:", error);
    }
  };

  // Filter requests by date range
  const filterByDateRange = (start: string, end: string) => {
    const filtered = allRequests.filter((request) => {
      // Extract the date part from dateNeeded (ignore the time)
      const requestDate = request.dateNeeded.split("T")[0];
      return requestDate >= start && requestDate <= end;
    });
    setFilteredRequests(filtered);
    setActivePage(1); // Reset to the first page after filtering
  };

  // Handle date range change
  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
  };

  // Handle date range search button click
  const handleDateRangeSearch = () => {
    filterByDateRange(dateRange.start, dateRange.end);
  };

  // Paginate requests
  const paginatedRequests = filteredRequests.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  // Export to PDF (column-style layout)
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.setFontSize(14); // Smaller title font size
    doc.text("Hardware Requests Report", 10, 10);

    // Set up table headers
    const headers = [
      "RID",
      "Date Needed",
      "Name",
      "Department",
      "Workstation",
      "Problem",
      "Status",
    ];

    // Set up table data (use filteredRequests instead of allRequests)
    const tableData = filteredRequests.map((request) => [
      request.requestId.toString(),
      request.dateNeeded.split("T")[0], // Format date
      request.name,
      request.department,
      request.workstation,
      request.problem,
      request.isFulfilled ? "Settled" : "On Hold", // Updated terms
    ]);

    // Set initial position for the table
    const startY = 20; // Start below the title
    const rowHeight = 8; // Smaller row height
    const colWidths = [15, 20, 30, 30, 30, 50, 15]; // Adjusted column widths to fit within the page
    const tableWidth = colWidths.reduce((a, b) => a + b, 0); // Total table width

    // Draw table headers
    doc.setFontSize(10); // Smaller header font size
    doc.setFont("helvetica", "bold");
    headers.forEach((header, index) => {
      const x = 10 + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
      const y = startY;
      doc.text(header, x + colWidths[index] / 2, y, { align: "center" }); // Center-align headers
    });

    // Draw table rows
    doc.setFontSize(8); // Smaller content font size
    doc.setFont("helvetica", "normal");
    tableData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = 10 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        const y = startY + (rowIndex + 1) * rowHeight;

        // Draw cell borders
        doc.rect(x, y - rowHeight / 2, colWidths[colIndex], rowHeight);

        // Center-align text within the cell
        doc.text(cell, x + colWidths[colIndex] / 2, y + 2, { align: "center", maxWidth: colWidths[colIndex] - 4 });
      });
    });

    // Draw outer border around the table
    doc.rect(10, startY - rowHeight / 2, tableWidth, (tableData.length + 1) * rowHeight);

    // Save the PDF
    doc.save("Hardware_Requests_Report.pdf");
  };

  // Open export confirmation modal
  const openExportModal = () => {
    setIsExportModalOpen(true);
  };

  // Close export confirmation modal
  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  // Handle export confirmation
  const handleExportConfirmation = () => {
    exportToPDF(); // Export to PDF
    closeExportModal(); // Close the modal
  };

  return (
    <div className={styles.wrapper} style={{ maxWidth: "2000px", padding: "20px" }}>
      <h3 className={styles.title}>Hardware Requests Report</h3>

      {/* 📅 Date Range Filter and Export Button */}
      <div className={styles.dateRangeContainer} style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "flex-end" }}>
        <TextInput
          type="date"
          label="Start Date"
          value={dateRange.start}
          onChange={(e) => handleDateRangeChange("start", e.target.value)}
        />
        <TextInput
          type="date"
          label="End Date"
          value={dateRange.end}
          onChange={(e) => handleDateRangeChange("end", e.target.value)}
        />
        <Button onClick={handleDateRangeSearch} style={{ marginTop: "24px" }}>
          Search
        </Button>
        <Button onClick={openExportModal} style={{ marginTop: "24px" }}>
          Export to PDF
        </Button>
      </div>

      {/* 📋 Table of Hardware Requests */}
      <div style={{ overflowX: "auto", marginBottom: "20px" }}></div>
      <Table className={styles.table} style={{ fontSize: "12px", marginBottom: "10px", minWidth: "1080px" }}>
        <thead>
          <tr>
            <th>Index</th>
            <th>Request ID</th>
            <th>Date Needed</th>
            <th>Name</th>
            <th>Department</th>
            <th>Workstation</th>
            <th>Problem</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRequests.length > 0 ? (
            paginatedRequests.map((request, index) => (
              <tr key={request.requestId}>
                <td>{index + 1}</td>
                <td>{request.requestId}</td>
                <td>{request.dateNeeded.split("T")[0]}</td>
                <td>{request.name}</td>
                <td>{request.department}</td>
                <td>{request.workstation}</td>
                <td>{request.problem}</td>
                <td>{request.isFulfilled ? "Settled" : "On Hold"}</td> {/* Updated terms */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>No hardware requests found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination
        total={Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)}
        value={activePage}
        onChange={setActivePage}
        className={styles.pagination}
        mt="md"
      />

      {/* Export Confirmation Modal */}
      <Modal
        opened={isExportModalOpen}
        onClose={closeExportModal}
        title="Confirm Export"
        size="sm"
      >
        <p>Are you sure you want to export the report to PDF?</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
          <Button variant="outline" onClick={closeExportModal}>
            Cancel
          </Button>
          <Button onClick={handleExportConfirmation}>Export</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Report;