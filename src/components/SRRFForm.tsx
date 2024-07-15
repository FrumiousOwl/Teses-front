/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Paper, Table, TextInput, Title, ScrollArea, ActionIcon, Button, Modal, Pagination, Notification } from '@mantine/core';
import { IconEdit, IconTrash, IconFileExport, IconPlus } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import classes from './SRRFForm.module.css';

export const initialData = [
  { rid: 222463, dateNeeded: '2024-05-06', name: 'Jonahlyn Eleazar', department: 'UER', endUser: 'DES2296', problem: 'Installed 16gb memory', materialsNeeded: '1pc power cord', srrfNo: 6202406 },
  { rid: 22583, dateNeeded: '2024-06-09', name: 'Haidee Virador', department: 'VAD', endUser: 'DES2349', problem: '1pc power cord', materialsNeeded: '1pc VGA to DP cable', srrfNo: 6202409 },
  // Add more data as needed
];

const ITEMS_PER_PAGE = 10;

export function SRRFForm() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', show: false });
  const [currentEdit, setCurrentEdit] = useState<any>(null);
  const [newForm, setNewForm] = useState<any>({
    dateNeeded: '',
    name: '',
    department: '',
    endUser: '',
    problem: '',
    materialsNeeded: '',
  });
  const [activePage, setActivePage] = useState(1);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setActivePage(1); // Reset to first page on search change
  };

  const handleEdit = (item: any) => {
    setCurrentEdit(item);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!validateForm(currentEdit)) return;

    setData(data.map((d) => (d.rid === currentEdit.rid ? currentEdit : d)));
    setEditModalOpen(false);
    showNotification('Form successfully edited');
  };

  const handleDelete = (rid: number) => {
    setData(data.filter(item => item.rid !== rid));
    showNotification('Form successfully deleted');
  };

  const handleConvertToPDF = async (item: any) => {
    const pdf = new jsPDF();
    const element = document.createElement('div');

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #4a90e2;">Service Requisition and Release Form</h1>
        <p>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style="font-size: 32px; line-height: 1.5; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4a90e2; border-radius: 20px;">
        <p><strong>RID:</strong> ${item.rid}</p>
        <p><strong>Date Needed:</strong> ${item.dateNeeded}</p>
        <p><strong>Name:</strong> ${item.name}</p>
        <p><strong>Department:</strong> ${item.department}</p>
        <p><strong>End User:</strong> ${item.endUser}</p>
        <p><strong>Problem:</strong> ${item.problem}</p>
        <p><strong>Materials Needed:</strong> ${item.materialsNeeded}</p>
        <p><strong>SRRF No.:</strong> ${item.srrfNo}</p>
      </div>
    `;

    document.body.appendChild(element);
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('srrf_form.pdf');
    document.body.removeChild(element);
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNewForm = () => {
    if (!validateForm(newForm)) return;

    const newRid = Math.max(...data.map(d => d.rid)) + 1;
    const newSrrfNo = Math.max(...data.map(d => d.srrfNo)) + 1;

    const newData = {
      rid: newRid,
      srrfNo: newSrrfNo,
      ...newForm,
    };

    setData([...data, newData]);
    setAddModalOpen(false);
    setNewForm({
      dateNeeded: '',
      name: '',
      department: '',
      endUser: '',
      problem: '',
      materialsNeeded: '',
    });
    showNotification('New form successfully added');
  };

  const validateForm = (form: any) => {
    if (
      !form.dateNeeded ||
      !form.name ||
      !form.department ||
      !form.endUser ||
      !form.problem ||
      !form.materialsNeeded
    ) {
      showNotification('All fields are required');
      return false;
    }
    return true;
  };

  const showNotification = (message: string) => {
    setNotification({ message, show: true });
    setTimeout(() => setNotification({ message: '', show: false }), 3000);
  };

  const filteredData = data.filter((item) =>
    item.rid.toString().includes(search) ||
    item.dateNeeded.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.department.toLowerCase().includes(search.toLowerCase()) ||
    item.endUser.toLowerCase().includes(search.toLowerCase()) ||
    item.srrfNo.toString().includes(search)
  );

  const paginatedData = filteredData.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} mt="md" mb="md">
          Service Requisition and Release Form
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
                <th>RID</th>
                <th>Date Needed</th>
                <th>Name</th>
                <th>Department</th>
                <th>End User</th>
                <th>Problem</th>
                <th>Materials Needed</th>
                <th>SRRF No.</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Convert to PDF</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.rid}>
                  <td>{item.rid}</td>
                  <td>{item.dateNeeded}</td>
                  <td>{item.name}</td>
                  <td>{item.department}</td>
                  <td>{item.endUser}</td>
                  <td>{item.problem}</td>
                  <td>{item.materialsNeeded}</td>
                  <td>{item.srrfNo}</td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={() => handleEdit(item)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={() => handleDelete(item.rid)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </td>
                  <td className={classes.actionIcon}>
                    <ActionIcon onClick={() => handleConvertToPDF(item)}>
                      <IconFileExport size={16} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>

        <Pagination
          total={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
          value={activePage}
          onChange={setActivePage}
          className={classes.pagination}
          mt="md"
        />

        <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Form">
          <div className={classes.label}>Date Needed</div>
          <input
            type="date"
            value={currentEdit?.dateNeeded || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, dateNeeded: e.currentTarget.value })}
            className={classes.input} // Add any necessary styling classes
            style={{ marginBottom: '16px' }}
          />
          <TextInput
            label="Name"
            value={currentEdit?.name || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, name: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Department"
            value={currentEdit?.department || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, department: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="End User"
            value={currentEdit?.endUser || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, endUser: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Problem"
            value={currentEdit?.problem || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, problem: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Materials Needed"
            value={currentEdit?.materialsNeeded || ''}
            onChange={(e) => setCurrentEdit({ ...currentEdit, materialsNeeded: e.currentTarget.value })}
            mb="md"
          />
          <Button onClick={handleSaveEdit}>Save</Button>
        </Modal>

        <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Form">
          <div className={classes.label}>Date Needed</div>
          <input
            type="date"
            value={newForm.dateNeeded}
            onChange={(e) => setNewForm({ ...newForm, dateNeeded: e.currentTarget.value })}
            className={classes.input} // Add any necessary styling classes
            style={{ marginBottom: '16px' }}
          />
          <TextInput
            label="Name"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Department"
            value={newForm.department}
            onChange={(e) => setNewForm({ ...newForm, department: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="End User"
            value={newForm.endUser}
            onChange={(e) => setNewForm({ ...newForm, endUser: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Problem"
            value={newForm.problem}
            onChange={(e) => setNewForm({ ...newForm, problem: e.currentTarget.value })}
            mb="sm"
          />
          <TextInput
            label="Materials Needed"
            value={newForm.materialsNeeded}
            onChange={(e) => setNewForm({ ...newForm, materialsNeeded: e.currentTarget.value })}
            mb="md"
          />
          <Button onClick={handleSaveNewForm}>Save</Button>
        </Modal>

        {notification.show && (
          <Notification
            onClose={() => setNotification({ message: '', show: false })}
            className={classes.notification}
          >
            {notification.message}
          </Notification>
        )}
      </Paper>
    </div>
  );
}
