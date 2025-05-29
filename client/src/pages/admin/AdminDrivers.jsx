import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { getDrivers } from '../../services/api';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_number: '',
    name: '',
    team_name: '',
    team_color: '',
    stats: {
      points: 0,
      wins: 0,
      podiums: 0,
      fastest_laps: 0,
      avg_position: 0
    }
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversData = await getDrivers();
        console.log('Dati piloti ricevuti:', driversData);
        // Assicurati che ogni pilota abbia un driver_id valido
        const validDrivers = driversData.filter(driver => driver.driver_id != null);
        console.log('Piloti validi:', validDrivers);
        setDrivers(validDrivers);
      } catch (error) {
        console.error('Errore nel recupero dei piloti:', error);
      }
    };

    fetchDrivers();
  }, []);

  const handleOpen = (driver = null) => {
    if (driver) {
      console.log('Dati pilota selezionato:', driver);
      setSelectedDriver(driver);
      setFormData({
        _id: driver._id || '',
        driver_id: driver.driver_id || '',
        driver_number: driver.driver_number || '',
        name: driver.name || '',
        team_name: driver.team_name || '',
        team_color: driver.team_color || '',
        stats: {
          points: driver.stats?.points || 0,
          wins: driver.stats?.wins || 0,
          podiums: driver.stats?.podiums || 0,
          fastest_laps: driver.stats?.fastest_laps || 0,
          avg_position: driver.stats?.avg_position || 0
        }
      });
    } else {
      setSelectedDriver(null);
      setFormData({
        _id: '',
        driver_id: '',
        driver_number: '',
        name: '',
        team_name: '',
        team_color: '',
        stats: {
          points: 0,
          wins: 0,
          podiums: 0,
          fastest_laps: 0,
          avg_position: 0
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDriver(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedData = {
        driver_number: parseInt(formData.driver_number),
        name: formData.name,
        team_name: formData.team_name,
        team_color: formData.team_color,
        stats: {
          points: parseInt(formData.stats.points) || 0,
          wins: parseInt(formData.stats.wins) || 0,
          podiums: parseInt(formData.stats.podiums) || 0,
          fastest_laps: parseInt(formData.stats.fastest_laps) || 0,
          avg_position: parseFloat(formData.stats.avg_position) || 0
        }
      };

      if (selectedDriver) {
        // Modifica pilota esistente
        await axios.put(`http://localhost:5000/api/drivers/${selectedDriver._id}`, formattedData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Aggiungi nuovo pilota
        await axios.post('http://localhost:5000/api/drivers', formattedData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      handleClose();
      // Ricarica la lista dei piloti
      const driversData = await getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Errore nel salvataggio del pilota:', error);
    }
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo pilota?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/drivers/${driverId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Ricarica la lista dei piloti
        const driversData = await getDrivers();
        setDrivers(driversData);
      } catch (error) {
        console.error('Errore nell\'eliminazione del pilota:', error);
      }
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
            Gestione Piloti
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: 'var(--f1-red)',
              '&:hover': {
                backgroundColor: 'var(--f1-red-dark)',
              },
            }}
            onClick={() => handleOpen()}
          >
            Aggiungi Pilota
          </Button>
        </Box>

        <Paper sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Numero</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Cognome</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Team</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{driver.driver_number || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{driver.name?.split(' ')[0] || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{driver.name?.split(' ').slice(1).join(' ') || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{driver.team_name || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleOpen(driver)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleDelete(driver._id)}
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

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {selectedDriver ? 'Modifica Pilota' : 'Nuovo Pilota'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Numero"
                type="number"
                value={formData.driver_number}
                onChange={(e) => setFormData({ ...formData, driver_number: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Team"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Colore Team"
                value={formData.team_color}
                onChange={(e) => setFormData({ ...formData, team_color: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Punti"
                type="number"
                value={formData.stats.points}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stats: { ...formData.stats, points: parseInt(e.target.value) || 0 }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Vittorie"
                type="number"
                value={formData.stats.wins}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stats: { ...formData.stats, wins: parseInt(e.target.value) || 0 }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Podi"
                type="number"
                value={formData.stats.podiums}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stats: { ...formData.stats, podiums: parseInt(e.target.value) || 0 }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Giri Veloci"
                type="number"
                value={formData.stats.fastest_laps}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stats: { ...formData.stats, fastest_laps: parseInt(e.target.value) || 0 }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Posizione Media"
                type="number"
                value={formData.stats.avg_position}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stats: { ...formData.stats, avg_position: parseFloat(e.target.value) || 0 }
                })}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annulla</Button>
            <Button onClick={handleSave} variant="contained">
              {selectedDriver ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDrivers; 