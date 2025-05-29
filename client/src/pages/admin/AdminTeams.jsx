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
import { getTeams } from '../../services/api';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    base: '',
    teamPrincipal: '',
    foundedYear: '',
    logo: ''
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getTeams();
        console.log('Dati team ricevuti:', teamsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Errore nel recupero dei team:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleOpen = (team = null) => {
    if (team) {
      console.log('Dati team selezionato:', team);
      setSelectedTeam(team);
      setFormData({
        name: team.name || '',
        base: team.base || '',
        teamPrincipal: team.teamPrincipal || '',
        foundedYear: team.foundedYear || '',
        logo: team.logo || ''
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        base: '',
        teamPrincipal: '',
        foundedYear: '',
        logo: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedData = {
        name: formData.name,
        base: formData.base,
        teamPrincipal: formData.teamPrincipal,
        foundedYear: parseInt(formData.foundedYear) || 0,
        logo: formData.logo || ''
      };

      if (selectedTeam) {
        // Modifica team esistente
        await axios.put(`http://localhost:5000/api/teams/${selectedTeam._id}`, formattedData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Aggiungi nuovo team
        await axios.post('http://localhost:5000/api/teams', formattedData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      handleClose();
      // Ricarica la lista dei team
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Errore nel salvataggio del team:', error);
    }
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo team?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/teams/${teamId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Ricarica la lista dei team
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Errore nell\'eliminazione del team:', error);
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
            Gestione Team
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
            Aggiungi Team
          </Button>
        </Box>

        <Paper sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Logo</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Base</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Anno di Fondazione</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Team Principal</TableCell>
                  <TableCell sx={{ color: 'var(--f1-white)' }}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell>
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={`${team.name} logo`} 
                          style={{ width: 40, height: 40, objectFit: 'contain' }} 
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{team.name}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{team.base}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{team.foundedYear || '-'}</TableCell>
                    <TableCell sx={{ color: 'var(--f1-white)' }}>{team.teamPrincipal || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleOpen(team)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: 'var(--f1-red)' }}
                        onClick={() => handleDelete(team._id)}
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
            {selectedTeam ? 'Modifica Team' : 'Nuovo Team'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome Team"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Base"
                value={formData.base}
                onChange={(e) => setFormData({ ...formData, base: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Team Principal"
                value={formData.teamPrincipal}
                onChange={(e) => setFormData({ ...formData, teamPrincipal: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Anno di Fondazione"
                type="number"
                value={formData.foundedYear}
                onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="URL Logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                margin="normal"
                helperText="Inserisci l'URL dell'immagine del logo del team"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annulla</Button>
            <Button onClick={handleSave} variant="contained">
              {selectedTeam ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminTeams; 