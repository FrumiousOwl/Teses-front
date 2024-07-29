import { utils, writeFile, WorkBook, WorkSheet } from 'xlsx';

export interface DataRow {
  supplierName: string;
  invoiceNo: number;
  orderDate: string;
  quantity: number;
  itemDescription: string;
  amount: number;
}

const formatSheet = (ws: WorkSheet) => {
  const range = utils.decode_range(ws['!ref']!);

  // Set column widths
  ws['!cols'] = [
    { wpx: 150 }, // Supplier Name
    { wpx: 100 }, // Invoice No.
    { wpx: 120 }, // Order Date
    { wpx: 80 },  // Quantity
    { wpx: 200 }, // Item Description
    { wpx: 120 }, // Amount
  ];

  // Define styles
  const headerStyle = {
    font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4F81BD' } },
  };

  // Apply header style
  for (let col = range.s.c; col <= range.e.c; col++) {
    const address = utils.encode_col(col) + '1';
    if (ws[address]) {
      ws[address].s = headerStyle;
    }
  }

  // Apply cell style
  const cellStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = utils.encode_cell({ r: row, c: col });
      if (ws[address]) {
        ws[address].s = cellStyle;
      }
    }
  }
};

export const exportToExcel = (data: DataRow[], fileName: string) => {
  try {
    const ws = utils.json_to_sheet(data);
    formatSheet(ws);
    const wb: WorkBook = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sheet1');
    writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};
