import React, { useState } from 'react';
import { TextInput, Table, Pagination } from '@mantine/core';
import styles from './DefectiveAssetsForm.module.css'; // Import CSS module

type Asset = {
  name: string;
  dateOfPurchase: string;
  defective: number;
  did: string; // Adding Did field
};

const initialAssets: Asset[] = [
  { name: 'Asset 1', dateOfPurchase: '2022-01-01', defective: 1, did: 'DID-001' },
  { name: 'Asset 2', dateOfPurchase: '2022-02-15', defective: 2, did: 'DID-002' },
  // Add more assets as needed
];

const ITEMS_PER_PAGE = 3; // Set the number of items per page

const DefectiveAssetsForm: React.FC = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(initialAssets);

  const handleSearch = (query: string) => {
    const filtered = initialAssets.filter(asset =>
      asset.did.toLowerCase().includes(query.toLowerCase()) ||
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
      <td>{asset.did}</td> {/* Displaying Did field */}
      <td>{asset.name}</td>
      <td>{asset.dateOfPurchase}</td>
      <td>{asset.defective}</td>
    </tr>
  ));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Defective Assets</h3>
      <div className={styles.search}>
        <TextInput
          className={styles.searchInput}
          placeholder="Search by DID, name, or date of purchase"
          onChange={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>
      <Table className={styles.table} striped highlightOnHover>
        <thead>
          <tr>
            <th>DID</th> {/* Adding Did column header */}
            <th>Name</th>
            <th>Date of Purchase</th>
            <th>Defective</th>
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

export default DefectiveAssetsForm;
