import { useState } from 'react';
import { Paper, Table, TextInput, Title, ScrollArea, ActionIcon, Button, Pagination, Notification, Modal } from '@mantine/core';
import { IconEdit, IconTrash, IconFileExport, IconPlus } from '@tabler/icons-react';
import { exportToExcel } from '../utils/excelUtils'; // Adjust the import path
import classes from './InvoiceReportForm.module.css'; // Adjust the path as needed

export type InvoiceData = {
  supplierName: string;
  invoiceNo: number;
  orderDate: string;
  quantity: number;
  itemDescription: string;
  amount: number;
};
const initialData: InvoiceData[] = [
  { supplierName: 'Keysys INC', invoiceNo: 36630, orderDate: '7/18/2024', quantity: 20, itemDescription: 'HDMI to VGA Cable', amount: 7000 },
  { supplierName: 'Keysys INC', invoiceNo: 36631, orderDate: '7/19/2024', quantity: 10, itemDescription: 'DP to VGA Cable', amount: 3500 },
  // More data
];
const ITEMS_PER_PAGE = 10;

const emptyForm: InvoiceData = {
  supplierName: '',
  invoiceNo: 0,
  orderDate: '',
  quantity: 0,
  itemDescription: '',
  amount: 0,
};

export function InvoiceReportForm() {
  const [data, setData] = useState<InvoiceData[]>(initialData);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [currentEdit, setCurrentEdit] = useState<InvoiceData | null>(null);
  const [newForm, setNewForm] = useState<InvoiceData>(emptyForm);
  const [activePage, setActivePage] = useState(1);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setActivePage(1); // Reset to first page on search change
  };

  const handleEdit = (item: InvoiceData) => {
    setCurrentEdit(item);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!validateForm(currentEdit)) return;
    if (currentEdit) {
      setData(data.map((d) => (d.invoiceNo === currentEdit.invoiceNo ? currentEdit : d)));
      setEditModalOpen(false);
      showNotification('Form successfully edited');
    }
  };

  const handleDelete = (invoiceNo: number) => {
    setData(data.filter(item => item.invoiceNo !== invoiceNo));
    showNotification('Form successfully deleted');
  };

  const handleConvertToExcel = () => {
    console.log('Data to export:', data); // Debugging output
    exportToExcel(data, 'invoice_report.xlsx');
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNewForm = () => {
    if (!validateForm(newForm)) return;
    const newData = { ...newForm };
    setData([...data, newData]);
    setAddModalOpen(false);
    setNewForm(emptyForm);
    showNotification('New form successfully added');
  };

  const validateForm = (form: InvoiceData | null) => {
    if (!form) {
      showNotification('Form is invalid');
      return false;
    }
    const requiredFields = ['supplierName', 'invoiceNo', 'orderDate', 'quantity', 'itemDescription', 'amount'];
    for (const field of requiredFields) {
      if (!form[field as keyof InvoiceData]) {
        showNotification('All fields are required');
        return false;
      }
    }
    return true;
  };

  const showNotification = (message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => setNotification({ message: '', show: false }), 3000);
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} mt="md" mb="md">
          Invoice Report Form
        </Title>

        <TextInput
          placeholder="Search"
          value={search}
          onChange={handleSearchChange}
          mb="md"
        />

        <div className={classes.addButton}>
          <Button onClick={handleAdd}>
            <IconPlus size={16} style={{ marginRight: '8px' }} />
            Add New
          </Button>
        </div>

        <ScrollArea>
          <Table className={classes.table} highlightOnHover>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Invoice No.</th>
                <th>Order Date</th>
                <th>Quantity</th>
                <th>Item Description</th>
                <th>Amount</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Convert to Excel</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.invoiceNo}>
                  <td>{item.supplierName}</td>
                  <td>{item.invoiceNo}</td>
                  <td>{item.orderDate}</td>
                  <td>{item.quantity}</td>
                  <td>{item.itemDescription}</td>
                  <td>{item.amount}</td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={() => handleEdit(item)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={() => handleDelete(item.invoiceNo)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={handleConvertToExcel}>
                      <IconFileExport size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>

        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
          className={classes.pagination}
        />
      </Paper>

      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Invoice">
        {/* Modal content for editing */}
        <TextInput
          label="Supplier Name"
          value={currentEdit?.supplierName || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, supplierName: e.target.value }))}
        />
        <TextInput
          label="Invoice No."
          value={currentEdit?.invoiceNo.toString() || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, invoiceNo: Number(e.target.value) }))}
        />
        <TextInput
          label="Order Date"
          value={currentEdit?.orderDate || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, orderDate: e.target.value }))}
        />
        <TextInput
          label="Quantity"
          value={currentEdit?.quantity.toString() || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, quantity: Number(e.target.value) }))}
        />
        <TextInput
          label="Item Description"
          value={currentEdit?.itemDescription || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, itemDescription: e.target.value }))}
        />
        <TextInput
          label="Amount"
          value={currentEdit?.amount.toString() || ''}
          onChange={(e) => setCurrentEdit((prev) => ({ ...prev!, amount: Number(e.target.value) }))}
        />
        <Button onClick={handleSaveEdit}>Save</Button>
      </Modal>

      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Invoice">
        {/* Modal content for adding */}
        <TextInput
          label="Supplier Name"
          value={newForm.supplierName}
          onChange={(e) => setNewForm((prev) => ({ ...prev, supplierName: e.target.value }))}
        />
        <TextInput
          label="Invoice No."
          value={newForm.invoiceNo.toString()}
          onChange={(e) => setNewForm((prev) => ({ ...prev, invoiceNo: Number(e.target.value) }))}
        />
        <TextInput
          label="Order Date"
          value={newForm.orderDate}
          onChange={(e) => setNewForm((prev) => ({ ...prev, orderDate: e.target.value }))}
        />
        <TextInput
          label="Quantity"
          value={newForm.quantity.toString()}
          onChange={(e) => setNewForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
        />
        <TextInput
          label="Item Description"
          value={newForm.itemDescription}
          onChange={(e) => setNewForm((prev) => ({ ...prev, itemDescription: e.target.value }))}
        />
        <TextInput
          label="Amount"
          value={newForm.amount.toString()}
          onChange={(e) => setNewForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
        />
        <Button onClick={handleSaveNewForm}>Save</Button>
      </Modal>

      {notification.show && (
        <Notification color="teal" onClose={() => setNotification({ message: '', show: false })}>
          {notification.message}
        </Notification>
      )}
    </div>
  );
}
