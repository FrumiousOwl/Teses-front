/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { TextInput, Button, Table, Modal, Pagination } from '@mantine/core';
import axios from 'axios';
import { useApi } from '../service/apiService';
import styles from './InputAssetsForm.module.css';

type Hardware = {
  hardwareId: number;
  name: string;
  description: string;
  datePurchased: string;
  defective: number;
  available: number;
  deployed: number;
  supplier: string;
};

const ITEMS_PER_PAGE = 10;

const InputAssetsForm: React.FC = () => {
  const [assets, setAssets] = useState<Hardware[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Hardware[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Hardware>({
    hardwareId: 0,
    name: '',
    description: '',
    datePurchased: new Date().toISOString().split('T')[0],
    defective: 0,
    available: 0,
    deployed: 0,
    supplier: '',
  });

  const [activePage, setActivePage] = useState(1);
  const customAxios = useApi();

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const response = await axios.get('https://localhost:7234/api/Hardware');
        const hardwareWithParsedDates = response.data.map((hardware: Hardware) => ({
          ...hardware,
          datePurchased: new Date(hardware.datePurchased).toISOString().split('T')[0],
        }));
        setAssets(hardwareWithParsedDates);
        setFilteredAssets(hardwareWithParsedDates);
      } catch (error) {
        console.error('Error fetching hardware:', error);
      }
    };
    fetchHardware();
  }, []);

  const handleSearch = async () => {
    try {
      if (!searchTerm) {
        setFilteredAssets(assets);
        return;
      }
      const response = await axios.get(`https://localhost:7234/api/Hardware/search?name=${searchTerm}`);
      setFilteredAssets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditHardware = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const editedHardware = {
        ...formData,
        datePurchased: new Date(formData.datePurchased).toISOString(),
      };
      await customAxios.put(`/Hardware/${editedHardware.hardwareId}`, editedHardware);

      const updatedAssets = assets.map(asset =>
        asset.hardwareId === editedHardware.hardwareId ? editedHardware : asset
      );
      setAssets(updatedAssets);
      setFilteredAssets(updatedAssets);

      setEditModalOpen(false);
      setFormData({
        hardwareId: 0,
        name: '',
        description: '',
        datePurchased: new Date().toISOString().split('T')[0],
        defective: 0,
        available: 0,
        deployed: 0,
        supplier: '',
      });
    } catch (error) {
      console.error('Error editing hardware:', error);
    }
  };

  const handleDeleteHardware = async (hardwareId: number) => {
    try {
      await customAxios.delete(`/Hardware/${hardwareId}`);
      const updatedAssets = assets.filter(asset => asset.hardwareId !== hardwareId);
      setAssets(updatedAssets);
      setFilteredAssets(updatedAssets);
    } catch (error) {
      console.error('Error deleting hardware:', error);
    }
  };

  const handleAddHardware = async () => {
    try {
      const newHardware: Hardware = {
        ...formData,
        datePurchased: new Date(formData.datePurchased).toISOString(),
      };
      const response = await customAxios.post<Hardware, Hardware>('/Hardware', newHardware);
      setAssets(prev => [...prev, response]);
      setFilteredAssets(prev => [...prev, response]);
      setAddModalOpen(false);
    } catch (error) {
      console.error('Error adding hardware:', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Button onClick={() => setAddModalOpen(true)}>Add Asset</Button>
      <Table>
        <thead>
          <tr>
            <th>Index</th>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Date Purchased</th>
            <th>Defective</th>
            <th>Available</th>
            <th>Deployed</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssets.map((hardware, index) => (
            <tr key={hardware.hardwareId}>
              <td>{index + 1}</td> 
              <td>{hardware.hardwareId}</td>
              <td>{hardware.name}</td>
              <td>{hardware.description}</td>
              <td>{hardware.datePurchased}</td>
              <td>{hardware.defective}</td>
              <td>{hardware.available}</td>
              <td>{hardware.deployed}</td>
              <td>{hardware.supplier}</td>
              <td>
                <Button
                  onClick={() => {
                    setCurrentEditIndex(hardware.hardwareId);
                    setFormData(hardware);
                    setEditModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button color="red" onClick={() => handleDeleteHardware(hardware.hardwareId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Hardware">
        <form onSubmit={handleAddHardware}>
          <TextInput label="Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Description" onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <TextInput label="Date Purchased" type="date" onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })} required />
          <TextInput label="Defective" type="number" onChange={(e) => setFormData({ ...formData, defective: Number(e.target.value) })} required />
          <TextInput label="Available" type="number" onChange={(e) => setFormData({ ...formData, available: Number(e.target.value) })} required />
          <TextInput label="Deployed" type="number" onChange={(e) => setFormData({ ...formData, deployed: Number(e.target.value) })} required />
          <TextInput label="Supplier" onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
          <Button type="submit">Submit</Button>
        </form>
      </Modal>

      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Hardware">
        <form onSubmit={handleEditHardware}>
          <TextInput label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <TextInput label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <TextInput label="Date Purchased" type="date" value={formData.datePurchased} onChange={(e) => setFormData({ ...formData, datePurchased: e.target.value })} required />
          <TextInput label="Defective" type="number" value={formData.defective} onChange={(e) => setFormData({ ...formData, defective: Number(e.target.value) })} required />
          <TextInput label="Available" type="number" value={formData.available} onChange={(e) => setFormData({ ...formData, available: Number(e.target.value) })} required />
          <TextInput label="Deployed" type="number" value={formData.deployed} onChange={(e) => setFormData({ ...formData, deployed: Number(e.target.value) })} required />
          <TextInput label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} required />
          <Button type="submit">Save Changes</Button>
        </form>
      </Modal>
    </div>
  );
};

export default InputAssetsForm;