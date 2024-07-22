import { useState } from 'react';
import { Paper, Table, TextInput, Title, ScrollArea, ActionIcon, Button, Modal, Pagination, Notification } from '@mantine/core';
import { IconEdit, IconTrash, IconFileExport, IconPlus } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import classes from './SRRFForm.module.css';

export const initialData = [
  { rid: 222463, dateNeeded: '06/05/2024', name: 'Jonahlyn Eleazar', department: 'UER', endUser: 'DES2296', problem: 'Installed 16gb memory', materialsNeeded: '1pc power cord', srrfNo: 6202406 },
  { rid: 22583, dateNeeded: '09/06/2024', name: 'Haidee Virador', department: 'VAD', endUser: 'DES2349', problem: '1pc power cord', materialsNeeded: '1pc VGA to DP cable', srrfNo: 6202409 },
  // Add more data as needed
];

const ITEMS_PER_PAGE = 10;

const emptyForm = {
  rid: '',
  dateNeeded: '',
  name: '',
  department: '',
  endUser: '',
  problem: '',
  materialsNeeded: '',
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

export function SRRFForm() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', show: false });
  const [currentEdit, setCurrentEdit] = useState<any>(null);
  const [newForm, setNewForm] = useState<any>(emptyForm);
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
    const element = createPDFElement(item);
    document.body.appendChild(element);
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (pdfWidth * canvas.height) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('srrf_form.pdf');
    document.body.removeChild(element);
  };

  const createPDFElement = (item: any) => {
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
    return element;
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNewForm = () => {
    if (!validateForm(newForm)) return;
    const newSrrfNo = Math.max(...data.map(d => d.srrfNo)) + 1;
    const newData = { srrfNo: newSrrfNo, ...newForm, dateNeeded: formatDate(newForm.dateNeeded) };
    setData([...data, newData]);
    setAddModalOpen(false);
    setNewForm(emptyForm);
    showNotification('New form successfully added');
  };

  const validateForm = (form: any) => {
    const requiredFields = ['rid', 'dateNeeded', 'name', 'department', 'endUser', 'problem', 'materialsNeeded'];
    for (let field of requiredFields) {
      if (!form[field]) {
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
          style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
        />

        <FormModal
          opened={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          form={currentEdit}
          setForm={setCurrentEdit}
          onSave={handleSaveEdit}
          title="Edit Form"
        />

        <FormModal
          opened={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          form={newForm}
          setForm={setNewForm}
          onSave={handleSaveNewForm}
          title="Add New Form"
        />

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

type FormModalProps = {
  opened: boolean;
  onClose: () => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  title: string;
};

const FormModal = ({ opened, onClose, form, setForm, onSave, title }: FormModalProps) => (
  <Modal opened={opened} onClose={onClose} title={title}>
    <TextInput
      label="RID"
      value={form?.rid || ''}
      onChange={(e) => setForm({ ...form, rid: e.currentTarget.value })}
      mb="sm"
    />
    <TextInput
      label="Date Needed"
      value={form?.dateNeeded || ''}
      onChange={(e) => setForm({ ...form, dateNeeded: e.currentTarget.value })}
      mb="sm"
      placeholder="DD/MM/YYYY"
    />
    <TextInput
      label="Name"
      value={form?.name || ''}
      onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
      mb="sm"
    />
    <TextInput
      label="Department"
      value={form?.department || ''}
      onChange={(e) => setForm({ ...form, department: e.currentTarget.value })}
      mb="sm"
    />
    <TextInput
      label="End User"
      value={form?.endUser || ''}
      onChange={(e) => setForm({ ...form, endUser: e.currentTarget.value })}
      mb="sm"
    />
    <TextInput
      label="Problem"
      value={form?.problem || ''}
      onChange={(e) => setForm({ ...form, problem: e.currentTarget.value })}
      mb="sm"
    />
    <TextInput
      label="Materials Needed"
      value={form?.materialsNeeded || ''}
      onChange={(e) => setForm({ ...form, materialsNeeded: e.currentTarget.value })}
      mb="md"
    />
    <Button onClick={onSave}>Save</Button>
  </Modal>
);
