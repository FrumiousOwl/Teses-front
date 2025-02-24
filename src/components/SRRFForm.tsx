/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Table, Pagination } from '@mantine/core';
import { useApi } from '../service/apiService';
import styles from './SRRFForm.module.css';

type HardwareRequest = {
  requestId: number;
  dateNeeded: string;
  name: string;
  department: string;
  workstation: string;
  problem: string;
  isFulfilled: boolean;
  hardwareId: number;
};

const ITEMS_PER_PAGE = 10;

const SRRFForm: React.FC = () => {
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HardwareRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState(1);
  
  const navigate = useNavigate();
  const customAxios = useApi();

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.error('User is not authenticated');
        navigate('/');
        return;
      }

      try {
        const response = await customAxios.get<HardwareRequest[]>('/api/HardwareRequest');
        setRequests(response);
        setFilteredRequests(response);
        
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredRequests(requests);
      return;
    }
    setFilteredRequests(
      requests.filter(request =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      <TextInput
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>

      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Workstation</th>
            <th>Problem</th>
            <th>Date Needed</th>
            <th>Fulfilled</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map(request => (
            <tr key={request.requestId}>
              <td>{request.requestId}</td>
              <td>{request.name}</td>
              <td>{request.department}</td>
              <td>{request.workstation}</td>
              <td>{request.problem}</td>
              <td>{request.dateNeeded}</td>
              <td>{request.isFulfilled ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination
        value={activePage}
        onChange={setActivePage}
        total={Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)}
      />
    </div>
  );
};

export default SRRFForm;
