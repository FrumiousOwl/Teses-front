/* eslint-disable no-empty-pattern */
import React, { useState } from 'react';
import { TextInput, Table } from '@mantine/core';
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
];

const DefectiveAssetsForm: React.FC = () => {
  const [] = useState<number>(0);
  const [assets] = useState<Asset[]>(initialAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(initialAssets);

  const handleSearch = (query: string) => {
    const filtered = assets.filter(asset =>
      asset.defective.toString().includes(query)
    );
    setFilteredAssets(filtered);
  };

  const rows = filteredAssets.map((asset, index) => (
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
          placeholder="Search by defective quantity"
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
    </div>
  );
};

export default DefectiveAssetsForm;
