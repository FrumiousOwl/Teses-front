import React, { useState, useEffect } from 'react';
import { TextInput, Button, Table, Modal, Pagination } from '@mantine/core';
import styles from './InputAssetsForm.module.css';
import { useApi } from '../service/apiService';

type Asset = {
  iid: number;
  name: string;
  dateOfPurchase: string;
  deployed: number;
  available: number;
  defective: number;
  quantity: number;
};

const api=useApi()



const ITEMS_PER_PAGE = 5;

const InputAssetsForm: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { iid: 1, name: 'Asset 1', deployed: 2, available: 7, defective: 1, dateOfPurchase: '2022-01-01', quantity: 10 },
    { iid: 2, name: 'Asset 2', deployed: 5, available: 9, defective: 1, dateOfPurchase: '2022-02-15', quantity: 15 },
    // Add more assets as needed
  ]);

  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(assets);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [newForm, setNewForm] = useState<Asset>({
    iid: 0,
    name: '',
    dateOfPurchase: '',
    deployed: 0,
    available: 0,
    defective: 0,
    quantity: 0,
  });
  const [activePage, setActivePage] = useState(1);
  const [assetData, setAssetData ] = useState(null);
  useEffect(() => {
  
    const fetchAsset= async () => {
      const data = await api.get(`localhost:7234/apiAsset`)
      setAssetData (data)
  
  }, [assetData])

  const handleSearch = (query: string) => {
    const filtered = assets.filter(asset =>
      asset.iid.toString().includes(query) ||
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.dateOfPurchase.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAssets(filtered);
    setActivePage(1); // Reset to first page on search change
  };
  

  const handleAddAsset = () => {
    const calculatedQuantity = newForm.deployed + newForm.available + newForm.defective;

    const newAsset: Asset = {
      ...newForm,
      quantity: calculatedQuantity,
      iid: assets.length + 1,
    };

    setAssets(prevAssets => [...prevAssets, newAsset]);
    setFilteredAssets(prevAssets => [...prevAssets, newAsset]);
    setNewForm({ iid: 0, name: '', dateOfPurchase: '', deployed: 0, available: 0, defective: 0, quantity: 0 });
    setAddModalOpen(false);
    setActivePage(Math.ceil((filteredAssets.length + 1) / ITEMS_PER_PAGE)); // Update active page
  };

  const handleDeleteAsset = (index: number) => {
    const newAssets = [...assets];
    newAssets.splice(index, 1);
    setAssets(newAssets);
    setFilteredAssets(newAssets);

    // Adjust the current page if necessary
    if (newAssets.length < (activePage - 1) * ITEMS_PER_PAGE) {
      setActivePage(Math.max(1, activePage - 1)); // Go to the previous page if the current page is empty
    }
  };

  const handleEditAsset = () => {
    if (currentEditIndex !== null) {
      const editedAsset = {
        ...newForm,
        quantity: newForm.deployed + newForm.available + newForm.defective,
      };

      const newAssets = [...assets];
      newAssets[currentEditIndex] = editedAsset;

      setAssets(newAssets);
      setFilteredAssets(newAssets);
      setNewForm({ iid: 0, name: '', dateOfPurchase: '', deployed: 0, available: 0, defective: 0, quantity: 0 });
      setEditModalOpen(false);
      setCurrentEditIndex(null);
    }
  };

  const openEditModal = (index: number) => {
    setCurrentEditIndex(index);
    const assetToEdit = assets[index];
    setNewForm({
      ...assetToEdit,
    });
    setEditModalOpen(true);
  };

  const handleDeployedChange = (value: string) => {
    const deployed = parseInt(value) || 0;
    setNewForm({ ...newForm, deployed });
  };

  const handleAvailableChange = (value: string) => {
    const available = parseInt(value) || 0;
    setNewForm({ ...newForm, available });
  };

  const handleDefectiveChange = (value: string) => {
    const defective = parseInt(value) || 0;
    setNewForm({ ...newForm, defective });
  };

  const paginatedAssets = filteredAssets.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const rows = paginatedAssets.map((asset, index) => (
    <tr key={index}>
      <td>{asset.iid}</td>
      <td>{asset.name}</td>
      <td>{asset.dateOfPurchase}</td>
      <td>{asset.deployed}</td>
      <td>{asset.available}</td>
      <td>{asset.defective}</td>
      <td>{asset.quantity}</td>
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
            placeholder="Search by IID, Name or Date of Purchase"
            onChange={(e) => handleSearch(e.currentTarget.value)}
          />
        </div>
        <Table className={styles.table} striped highlightOnHover>
          <thead>
            <tr>
              <th>IID</th>
              <th>Name</th>
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
          value={newForm.name}
          onChange={(e) => setNewForm({ ...newForm, name: e.currentTarget.value })}
          required
        />
        <TextInput
          label="Deployed"
          placeholder="Enter deployed quantity"
          value={newForm.deployed.toString()}
          onChange={(e) => handleDeployedChange(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Available"
          placeholder="Enter available quantity"
          value={newForm.available.toString()}
          onChange={(e) => handleAvailableChange(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Defective"
          placeholder="Enter defective quantity"
          value={newForm.defective.toString()}
          onChange={(e) => handleDefectiveChange(e.currentTarget.value)}
          required
        />
        <div className={styles.datePickerWrapper}>
          <label className={styles.datePickerLabel}>Date of Purchase</label>
          <TextInput
            type="date"
            value={newForm.dateOfPurchase}
            onChange={(e) => setNewForm({ ...newForm, dateOfPurchase: e.currentTarget.value })}
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
          value={newForm.name}
          onChange={(e) => setNewForm({ ...newForm, name: e.currentTarget.value })}
          required
        />
        <TextInput
          label="Deployed"
          placeholder="Enter deployed quantity"
          value={newForm.deployed.toString()}
          onChange={(e) => handleDeployedChange(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Available"
          placeholder="Enter available quantity"
          value={newForm.available.toString()}
          onChange={(e) => handleAvailableChange(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Defective"
          placeholder="Enter defective quantity"
          value={newForm.defective.toString()}
          onChange={(e) => handleDefectiveChange(e.currentTarget.value)}
          required
        />
        <div className={styles.datePickerWrapper}>
          <label className={styles.datePickerLabel}>Date of Purchase</label>
          <TextInput
            type="date"
            value={newForm.dateOfPurchase}
            onChange={(e) => setNewForm({ ...newForm, dateOfPurchase: e.currentTarget.value })}
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
function useEffect(arg0: () => void) {
  throw new Error('Function not implemented.');
}

