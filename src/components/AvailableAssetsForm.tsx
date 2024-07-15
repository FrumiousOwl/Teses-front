import React, { useState } from 'react';
import { TextInput, Table, Pagination } from '@mantine/core';
import styles from './AvailableAssetsForm.module.css';

type Asset = {
  aid: string;
  name: string;
  dateOfPurchase: string;
  deployed: number;
  available: number;
};

const initialAssets: Asset[] = [
  { aid: 'AID-001', name: 'Asset 1', dateOfPurchase: '2022-01-01', deployed: 2, available: 7 },
  { aid: 'AID-002', name: 'Asset 2', dateOfPurchase: '2022-02-15', deployed: 5, available: 9 },
];

const ITEMS_PER_PAGE = 3; // Set the number of items per page

const AvailableAssetsForm: React.FC = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(initialAssets);

  const handleSearch = (query: string) => {
    const filtered = initialAssets.filter(asset =>
      asset.aid.toLowerCase().includes(query.toLowerCase()) ||
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.dateOfPurchase.includes(query)
    );
    setFilteredAssets(filtered);
    setActivePage(1); // Reset to first page on search
  };

  const paginatedAssets = filteredAssets.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  const rows = paginatedAssets.map((asset, index) => (
    <tr key={index}>
      <td>{asset.aid}</td>
      <td>{asset.name}</td>
      <td>{asset.dateOfPurchase}</td>
      <td>{asset.available}</td>
      <td>{asset.deployed}</td>
    </tr>
  ));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Available Assets</h3>
      <div className={styles.search}>
        <TextInput
          className={styles.searchInput}
          placeholder="Search by AID, name or date of purchase"
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>
      <Table className={styles.table} striped highlightOnHover>
        <thead>
          <tr>
            <th>AID</th>
            <th>Name</th>
            <th>Date of Purchase</th>
            <th>Available</th>
            <th>Deployed</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      <Pagination
        total={Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)}
        value={activePage}
        onChange={setActivePage}
        className={styles.pagination}
        mt="md"
      />
    </div>
  );
};

export default AvailableAssetsForm;
