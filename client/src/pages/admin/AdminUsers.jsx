import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    isAdmin: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Errore nel recupero degli utenti:', error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    });
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchUsers();
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'utente:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'var(--f1-white)' }}>
            Gestione Utenti
          </Typography>
        </Box>

        <Paper sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Username</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Email</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Ruolo</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Data Registrazione</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Predizioni</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Stato</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{user.username}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{user.email}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>
                      <Chip 
                        label={user.isAdmin ? 'Admin' : 'Utente'} 
                        sx={{ 
                          backgroundColor: user.isAdmin ? 'var(--f1-red)' : 'var(--f1-gray)',
                          color: 'var(--f1-white)'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>
                      {user.predictions?.length || 0}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>
                      <Chip 
                        label={user.isActive ? 'Attivo' : 'Disattivato'} 
                        sx={{ 
                          backgroundColor: user.isActive ? 'var(--f1-green)' : 'var(--f1-gray)',
                          color: 'var(--f1-white)'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleDelete(user._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Modifica Utente</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Username"
              fullWidth
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <Box sx={{ mt: 2 }}>
              <Chip
                label={editForm.isAdmin ? 'Admin' : 'Utente'}
                color={editForm.isAdmin ? 'primary' : 'default'}
                onClick={() => setEditForm({ ...editForm, isAdmin: !editForm.isAdmin })}
                clickable
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annulla</Button>
            <Button onClick={handleSave} color="primary">
              Salva
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminUsers; 