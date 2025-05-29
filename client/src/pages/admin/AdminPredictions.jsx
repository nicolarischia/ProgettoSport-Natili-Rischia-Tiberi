import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';

const AdminPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [races, setRaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [editForm, setEditForm] = useState({
    race: '',
    driver: '',
    position: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Recupera predizioni, gare e piloti in parallelo
      const [predictionsRes, racesRes, driversRes] = await Promise.all([
        axios.get('http://localhost:5000/api/predictions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/races'),
        axios.get('http://localhost:5000/api/drivers')
      ]);

      setPredictions(predictionsRes.data);
      setRaces(racesRes.data);
      setDrivers(driversRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Errore nel recupero dei dati:', error);
      setError('Errore nel recupero dei dati');
      setLoading(false);
    }
  };

  const handleEdit = (prediction) => {
    setSelectedPrediction(prediction);
    setEditForm({
      race: prediction.race,
      driver: prediction.driver,
      position: prediction.position,
      notes: prediction.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (predictionId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa predizione?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/predictions/${predictionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Errore nell\'eliminazione della predizione:', error);
        setError('Errore nell\'eliminazione della predizione');
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/predictions/${selectedPrediction._id}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento della predizione:', error);
      setError('Errore nell\'aggiornamento della predizione');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Typography variant="h4" sx={{ color: 'var(--f1-white)', mb: 3 }}>
          Gestione Predizioni
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Gara</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Pilota</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Posizione</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Note</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Utente</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction._id}>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{prediction.race}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{prediction.driver}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{prediction.position}°</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{prediction.notes || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>
                      {prediction.user?.username || 'Utente non disponibile'}
                      <Typography variant="caption" display="block" sx={{ color: 'var(--f1-gray)' }}>
                        {prediction.user?.email || 'Email non disponibile'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleEdit(prediction)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleDelete(prediction._id)}
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
          <DialogTitle>Modifica Predizione</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Gara</InputLabel>
              <Select
                value={editForm.race}
                label="Gara"
                onChange={(e) => setEditForm({ ...editForm, race: e.target.value })}
              >
                {races.map((race) => (
                  <MenuItem key={race.session_key} value={race.circuit_name}>
                    {race.circuit_name} - {new Date(race.date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Pilota</InputLabel>
              <Select
                value={editForm.driver}
                label="Pilota"
                onChange={(e) => setEditForm({ ...editForm, driver: e.target.value })}
              >
                {drivers.map((driver) => (
                  <MenuItem key={driver.driver_id} value={driver.name}>
                    {driver.name} - {driver.team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Posizione</InputLabel>
              <Select
                value={editForm.position}
                label="Posizione"
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
              >
                {[...Array(20)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}°
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Note"
              fullWidth
              multiline
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />
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

export default AdminPredictions; 