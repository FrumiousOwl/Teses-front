// Report.tsx
import React, { useState } from 'react';
import { Paper, Table, TextInput, Title, ScrollArea, Button } from '@mantine/core';
import { initialData } from './SRRFForm'; // Assuming initialData is exported from SRRFForm
import { IconFileExport } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Reports.module.css'; // Import CSS module

interface ServiceRecord {
  rid: number;
  dateNeeded: string;
  name: string;
  department: string;
  endUser: string;
  problem: string;
  materialsNeeded: string;
  srrfNo: number;
}

const Report: React.FC = () => {
  const [monthlyStartDate, setMonthlyStartDate] = useState<string>('');
  const [monthlyEndDate, setMonthlyEndDate] = useState<string>('');
  const [yearlyStartDate, setYearlyStartDate] = useState<string>('');
  const [yearlyEndDate, setYearlyEndDate] = useState<string>('');

  const handleMonthlyReport = () => {
    const filteredData = initialData.filter(item => {
      const itemDate = new Date(item.dateNeeded);
      const filterStartDate = new Date(monthlyStartDate);
      const filterEndDate = new Date(monthlyEndDate);
      return itemDate >= filterStartDate && itemDate <= filterEndDate;
    });
    return filteredData;
  };

  const handleYearlyReport = () => {
    const filteredData = initialData.filter(item => {
      const itemYear = new Date(item.dateNeeded).getFullYear();
      const filterYear = new Date(yearlyStartDate).getFullYear();
      return itemYear === filterYear;
    });
    return filteredData;
  };

  const handleMonthlyStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyStartDate(event.target.value);
  };

  const handleMonthlyEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyEndDate(event.target.value);
  };

  const handleYearlyStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYearlyStartDate(event.target.value);
  };

  const handleYearlyEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYearlyEndDate(event.target.value);
  };

  const handleExportToPDF = async (filteredData: ServiceRecord[], reportType: string) => {
    const pdf = new jsPDF();
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const title = reportType === 'monthly' ? 'Monthly Report' : 'Yearly Report';

    let content = `
      <div style="text-align: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #4a90e2;">${title}</h1>
        <p>Generated on: ${date}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">RID</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Date Needed</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Name</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Department</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">End User</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Problem</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Materials Needed</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">SRRF No.</th>
          </tr>
        </thead>
        <tbody>
    `;

    filteredData.forEach(item => {
      content += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.rid}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.dateNeeded}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.department}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.endUser}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.problem}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.materialsNeeded}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.srrfNo}</td>
        </tr>
      `;
    });

    content += `
        </tbody>
      </table>
    `;

    const element = document.createElement('div');
    element.innerHTML = content;

    document.body.appendChild(element);
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title.toLowerCase().replace(' ', '_')}_report.pdf`);
    document.body.removeChild(element);
  };

  const monthlyFilteredData = monthlyStartDate && monthlyEndDate ? handleMonthlyReport() : [];
  const yearlyFilteredData = yearlyStartDate && yearlyEndDate ? handleYearlyReport() : [];

  return (
    <Paper className={styles.wrapper}>
      <Title order={2} className={styles.title}>
        Report
      </Title>

      <div className={styles.dateInputs}>
        {/* Monthly Report Date Inputs */}
        <div className={styles.dateInputSection}>
          <Title order={3}>Monthly Report</Title>
          <TextInput
            type="date"
            value={monthlyStartDate}
            onChange={handleMonthlyStartDateChange}
            placeholder="Start Date"
            className={styles.input}
          />
          <TextInput
            type="date"
            value={monthlyEndDate}
            onChange={handleMonthlyEndDateChange}
            placeholder="End Date"
            className={styles.input}
          />
          <Button
            className={styles.button}
            onClick={() => handleExportToPDF(monthlyFilteredData, 'monthly')}
          >
            <IconFileExport size={16} style={{ marginRight: '8px'}} />
            Export to PDF
          </Button>
        </div>

        {/* Yearly Report Date Inputs */}
        <div className={styles.dateInputSection}>
          <Title order={3}>Yearly Report</Title>
          <TextInput
            type="date"
            value={yearlyStartDate}
            onChange={handleYearlyStartDateChange}
            placeholder="Start Date"
            className={styles.input}
          />
          <TextInput
            type="date"
            value={yearlyEndDate}
            onChange={handleYearlyEndDateChange}
            placeholder="End Date"
            className={styles.input}
          />
          <Button
            className={styles.button}
            onClick={() => handleExportToPDF(yearlyFilteredData, 'yearly')}
          >
            <IconFileExport size={16} style={{ marginRight: '8px'}} />
            Export to PDF
          </Button>
        </div>
      </div>

      {monthlyStartDate && monthlyEndDate && monthlyFilteredData.length > 0 && (
        <div className={styles.reportSection}>
          <Title order={3}>Monthly Report Results</Title>
          <ScrollArea className={styles.scrollArea}>
            <Table className={styles.table}>
              <thead>
                <tr>
                  <th>RID</th>
                  <th>Date Needed</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>End User</th>
                  <th>Problem</th>
                  <th>Materials Needed</th>
                  <th>SRRF No.</th>
                </tr>
              </thead>
              <tbody>
                {monthlyFilteredData.map((item: ServiceRecord) => (
                  <tr key={item.rid}>
                    <td>{item.rid}</td>
                    <td>{item.dateNeeded}</td>
                    <td>{item.name}</td>
                    <td>{item.department}</td>
                    <td>{item.endUser}</td>
                    <td>{item.problem}</td>
                    <td>{item.materialsNeeded}</td>
                    <td>{item.srrfNo}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {yearlyStartDate && yearlyEndDate && yearlyFilteredData.length > 0 && (
        <div className={styles.reportSection}>
          <Title order={3}>Yearly Report Results</Title>
          <ScrollArea className={styles.scrollArea}>
            <Table className={styles.table}>
              <thead>
                <tr>
                  <th>RID</th>
                  <th>Date Needed</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>End User</th>
                  <th>Problem</th>
                  <th>Materials Needed</th>
                  <th>SRRF No.</th>
                </tr>
              </thead>
              <tbody>
                {yearlyFilteredData.map((item: ServiceRecord) => (
                  <tr key={item.rid}>
                    <td>{item.rid}</td>
                    <td>{item.dateNeeded}</td>
                    <td>{item.name}</td>
                    <td>{item.department}</td>
                    <td>{item.endUser}</td>
                    <td>{item.problem}</td>
                    <td>{item.materialsNeeded}</td>
                    <td>{item.srrfNo}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </Paper>
  );
};

export default Report;
