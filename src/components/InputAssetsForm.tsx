/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { TextInput, Button, Table, Modal, Pagination } from '@mantine/core';
import axios from 'axios';
import { useApi } from '../service/apiService';
import styles from './InputAssetsForm.module.css';

type Category = {
  categoryId: number;
  name: string;
  description: string;
  datePurchased: string;
  deployed: number;
  available: number;
  defective: number;
  quantity: number;
};


const ITEMS_PER_PAGE = 10;

const InputAssetsForm: React.FC = () => {
  const [assets, setAssets] = useState<Category[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Category>({
    categoryId: 0,
    name: '',
    description: '',
    datePurchased: new Date().toISOString(),
    deployed: 0,
    available: 0,
    defective: 0,
    quantity: 0,
  });
  const [activePage, setActivePage] = useState(1);
  const customAxios = useApi();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://localhost:7234/api/Category');
        const categoriesWithParsedDates = response.data.map((category: Category) => ({
          ...category,
          datePurchased: new Date(category.datePurchased).toLocaleDateString(),
        }));
        setCategories(categoriesWithParsedDates);
        setFilteredAssets(categoriesWithParsedDates);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error fetching categories:', error.response?.data || error.message);
        } else {
          console.error('Unexpected error:', (error as Error).message);
        }
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (query: string) => {
    const filtered = assets.filter(asset =>
      asset.categoryId.toString().includes(query) ||
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.datePurchased?.split('T')[0].includes(query)
    );
    setFilteredAssets(filtered);
    setActivePage(1); // Reset to first page on search change
  };

  const handleAddAsset = async () => {
    try {
      const calculatedQuantity = formData.deployed + formData.available + formData.defective;
      const newAsset: Category = {
        ...formData,
        datePurchased: new Date(formData.datePurchased).toISOString(),
      };
  
      // Attempt to POST to /Category
      const data = await customAxios.post<Category, Category>('/Category', newAsset);
      console.log('Asset added successfully:', data); // Debug log
  
      setAssets(prevAssets => [...prevAssets, data]);
      setFilteredAssets(prevAssets => [...prevAssets, data]);
      setFormData({ categoryId: 0, name: '', description: '', datePurchased: new Date().toISOString(), deployed: 0, available: 0, defective: 0, quantity: 0 });
      setAddModalOpen(false);
      setActivePage(Math.ceil((filteredAssets.length + 1) / ITEMS_PER_PAGE)); // Update active page
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding asset:', error.response?.data || error.message);
        alert(`Error adding asset: ${error.response?.data || error.message}`); // Display the error to the user
      } else {
        console.error('Unexpected error:', (error as Error).message);
        alert(`Unexpected error: ${(error as Error).message}`); // Display the error to the user
      }
    }
  };

  const handleDeleteAsset = async (index: number) => {
    try {
      const assetToDelete = assets[index];
      await customAxios.delete(`/category/${assetToDelete.categoryId}`);

      const newAssets = [...assets];
      newAssets.splice(index, 1);
      setAssets(newAssets);
      setFilteredAssets(newAssets);

      // Adjust the current page if necessary
      if (newAssets.length < (activePage - 1) * ITEMS_PER_PAGE) {
        setActivePage(Math.max(1, activePage - 1)); // Go to the previous page if the current page is empty
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting asset:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', (error as Error).message);
      }
    }
  };

  const handleEditAsset = async () => {
    if (currentEditIndex !== null) {
      try {
        const editedAsset = {
          ...formData,
          quantity: formData.deployed + formData.available + formData.defective,
        };

        const data = await customAxios.put<Category, Category>(`/assets/${editedAsset.categoryId}`, editedAsset);

        const newAssets = [...assets];
        newAssets[currentEditIndex] = data;

        setAssets(newAssets);
        setFilteredAssets(newAssets);
        setFormData({ categoryId: 0, name: '', description: '', datePurchased: new Date().toISOString(), deployed: 0, available: 0, defective: 0, quantity: 0 });
        setEditModalOpen(false);
        setCurrentEditIndex(null);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error editing asset:', error.response?.data || error.message);
        } else {
          console.error('Unexpected error:', (error as Error).message);
        }
      }
    }
  };

  const openEditModal = (index: number) => {
    setCurrentEditIndex(index);
    const assetToEdit = assets[index];
    setFormData({
      ...assetToEdit,
      datePurchased: new Date(assetToEdit.datePurchased).toISOString(), // Ensure date is a Date object
    });
    setEditModalOpen(true);
  };

  const handleInputChange = (field: keyof Category, value: string) => {
    const parsedValue = ['deployed', 'available', 'defective'].includes(field) ? parseInt(value) || 0 : value;
    setFormData({ ...formData, [field]: parsedValue });
  };

  const handleDateChange = (value: string) => {
    setFormData({ ...formData, datePurchased: new Date(value).toISOString() });
  };

  const paginatedAssets = Array.isArray(filteredAssets) ? filteredAssets.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE) : [];

  const rows = paginatedAssets.map((category, index) => (
    <tr key={index}>
      <td>{category.categoryId}</td>
      <td>{category.name}</td>
      <td>{category.description}</td>
      <td>{category.datePurchased?.split('T')[0]}</td>
      <td>{category.deployed}</td>
      <td>{category.available}</td>
      <td>{category.defective}</td>
      <td>{category.quantity}</td>
      <td>
        <Button onClick={() => openEditModal(index + (activePage - 1) * ITEMS_PER_PAGE)} size="xs" mr="xs">
          Edit
        </Button>
        <Button onClick={() => handleDeleteAsset(index + (activePage - 1) * ITEMS_PER_PAGE)} size="xs" color="red">
          Delete
        </Button>
      </td>
    </tr>
  ));

  return (
    <div className={styles.wrapper}>
      <div className={styles.form}>
        <h2 className={styles.title}>Input Assets</h2>
        <div className={styles.search}>
          <TextInput
            className={styles.searchInput}
            placeholder="Search by categoryId, Name or Date of Purchase"
            onChange={(e) => handleSearch(e.currentTarget.value)}
          />
        </div>
        <Table className={styles.table} striped highlightOnHover>
          <thead>
            <tr>
              <th>IID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date of Purchase</th>
              <th>Deployed</th>
              <th>Available</th>
              <th>Defective</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <div className={styles.pagination}>
          <Pagination
            total={Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)}
            value={activePage}
            onChange={setActivePage}
          />
        </div>
        <div className={styles.addButton}>
          <Button onClick={() => setAddModalOpen(true)}>Add New Asset</Button>
        </div>
      </div>

      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Asset">
        <TextInput
          label="Asset Name"
          placeholder="Enter asset name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Description"
          placeholder="Enter asset description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Deployed"
          placeholder="Enter deployed quantity"
          value={formData.deployed.toString()}
          onChange={(e) => handleInputChange('deployed', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Available"         
          placeholder="Enter available quantity"
          value={formData.available.toString()}
          onChange={(e) => handleInputChange('available', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Defective"
          placeholder="Enter defective quantity"
          value={formData.defective.toString()}
          onChange={(e) => handleInputChange('defective', e.currentTarget.value)}
          required
        />
        <div className={styles.datePickerWrapper}>
          <label className={styles.datePickerLabel}>Date of Purchase</label>
          <TextInput
            type="date"
            value={formData.datePurchased?.split('T')[0]}
            onChange={(e) => handleDateChange(e.currentTarget.value)}
            required
          />
        </div>
        <Button onClick={handleAddAsset} fullWidth mt="md">
          Add Asset
        </Button>
      </Modal>

      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Asset">
        <TextInput
          label="Asset Name"
          placeholder="Enter asset name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Description"
          placeholder="Enter asset description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Deployed"
          placeholder="Enter deployed quantity"
          value={formData.deployed.toString()}
          onChange={(e) => handleInputChange('deployed', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Available"
          placeholder="Enter available quantity"
          value={formData.available.toString()}
          onChange={(e) => handleInputChange('available', e.currentTarget.value)}
          required
        />
        <TextInput
          label="Defective"
          placeholder="Enter defective quantity"
          value={formData.defective.toString()}
          onChange={(e) => handleInputChange('defective', e.currentTarget.value)}
          required
        />
        <div className={styles.datePickerWrapper}>
          <label className={styles.datePickerLabel}>Date of Purchase</label>
          <TextInput
            type="date"
            value={formData.datePurchased?.split('T')[0]}
            onChange={(e) => handleDateChange(e.currentTarget.value)}
            required
          />
        </div>
        <Button onClick={handleEditAsset} fullWidth mt="md">
          Edit Asset
        </Button>
      </Modal>
    </div>
  );
};

export default InputAssetsForm;

