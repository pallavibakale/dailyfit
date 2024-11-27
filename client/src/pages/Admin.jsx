import styled from "styled-components";
import { Container } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getAdminDashboard } from "../api";
const Wrapper = styled.div`
  flex: 1;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f4f4f4;
`;

const TableData = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
`;

const DeleteButton = styled.button`
  padding: 5px 10px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;
const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]); // Initialize as an empty array
    const [buttonLoading, setButtonLoading] = useState(false);
  
    // Fetch dashboard data
    const dashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("dailyfit-app-token");
  
      try {
        const res = await getAdminDashboard(token);
        console.log("response", res.data.users); // Log the correct data for debugging
        setData(res.data.users || []); // Use the correct property and fallback to an empty array
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
  
    // Handle user deletion
    const handleDelete = async (userId) => {
      setButtonLoading(true);
      const token = localStorage.getItem("dailyfit-app-token");
  
      try {
        // Replace with your API endpoint for deleting users
        // await API.delete(`/users/${userId}`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
  
        // Remove the deleted user from the state
        setData((prev) => prev.filter((user) => user._id !== userId));
        setButtonLoading(false);
      } catch (err) {
        console.error(err);
        setButtonLoading(false);
      }
    };
  
    useEffect(() => {
      dashboardData(); // Fetch the data when the component mounts
    }, []); // Empty dependency array ensures it runs only once
  
    if (loading) return <p>Loading...</p>;
  
    return (
      <Container>
        <Wrapper>
          <Title>Admin Dashboard</Title>
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Created At</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((user) => (
                  <tr key={user._id}>
                    <TableData>{user.name || "N/A"}</TableData>
                    <TableData>{user.email || "N/A"}</TableData>
                    <TableData>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableData>
                    <TableData>
                      <DeleteButton onClick={() => handleDelete(user._id)}>
                        Delete
                      </DeleteButton>
                    </TableData>
                  </tr>
                ))
              ) : (
                <tr>
                  <TableData colSpan="4">No users found.</TableData>
                </tr>
              )}
            </tbody>
          </Table>
        </Wrapper>
      </Container>
    );
  };
  
  export default AdminDashboard;
  