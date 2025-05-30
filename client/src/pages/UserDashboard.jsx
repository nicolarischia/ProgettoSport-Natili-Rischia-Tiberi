import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Stati per i dialoghi
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
    const [editPredictionOpen, setEditPredictionOpen] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);

    // Stati per i form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
        fetchUserPredictions();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                // Prova a leggere il messaggio di errore dal backend
                const errorData = await response.json();
                throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Errore nel caricamento dei dati utente:', error);
            setError(`Errore nel caricamento dei dati utente: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPredictions = async () => {
        try {
            const response = await fetch('/api/predictions/my-predictions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Errore nel recupero delle predizioni');
            const data = await response.json();
            setPredictions(data);
        } catch (error) {
            setError('Errore nel caricamento delle predizioni');
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (!response.ok) throw new Error('Errore nel cambio password');
            
            setSuccess('Password modificata con successo');
            setChangePasswordOpen(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError('Errore nel cambio password');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Errore nella cancellazione dell\'account');
            
            logout();
            navigate('/login');
        } catch (error) {
            setError('Errore nella cancellazione dell\'account');
        }
    };

    const handleEditPrediction = async (prediction) => {
        setSelectedPrediction(prediction);
        setEditPredictionOpen(true);
    };

    const handleUpdatePrediction = async () => {
        try {
            const response = await fetch(`/api/predictions/${selectedPrediction._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(selectedPrediction)
            });

            if (!response.ok) throw new Error('Errore nell\'aggiornamento della predizione');
            
            setSuccess('Predizione aggiornata con successo');
            setEditPredictionOpen(false);
            fetchUserPredictions();
        } catch (error) {
            setError('Errore nell\'aggiornamento della predizione');
        }
    };

    const handleDeletePrediction = async (predictionId) => {
        try {
            const response = await fetch(`/api/predictions/${predictionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Errore nella cancellazione della predizione');
            
            setSuccess('Predizione cancellata con successo');
            fetchUserPredictions();
        } catch (error) {
            setError('Errore nella cancellazione della predizione');
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Sezione Informazioni Utente */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
                        <Typography variant="h5" gutterBottom color="primary">
                            Informazioni Account
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography><strong>Email:</strong> {userData?.email}</Typography>
                            <Typography>
                                <strong>Data Registrazione:</strong> 
                                {userData?.createdAt ? 
                                    (new Date(userData.createdAt).toString() !== 'Invalid Date' ? 
                                        new Date(userData.createdAt).toLocaleDateString() : 
                                        'Data non valida') 
                                    : 'N/A'}
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setChangePasswordOpen(true)}
                                sx={{ mr: 2 }}
                            >
                                Cambia Password
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setDeleteAccountOpen(true)}
                            >
                                Cancella Account
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sezione Predizioni */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
                        <Typography variant="h5" gutterBottom color="primary">
                            Le Mie Predizioni
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Gara</TableCell>
                                        <TableCell>Pilota</TableCell>
                                        <TableCell>Posizione</TableCell>
                                        <TableCell>Note</TableCell>
                                        <TableCell>Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {predictions.map((prediction) => (
                                        <TableRow key={prediction._id}>
                                            <TableCell>{prediction.race}</TableCell>
                                            <TableCell>{prediction.driver}</TableCell>
                                            <TableCell>{prediction.position}</TableCell>
                                            <TableCell>{prediction.notes}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditPrediction(prediction)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeletePrediction(prediction._id)}
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
                </Grid>
            </Grid>

            {/* Dialog Cambio Password */}
            <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
                <DialogTitle>Cambia Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Password Attuale"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Nuova Password"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Conferma Nuova Password"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChangePasswordOpen(false)}>Annulla</Button>
                    <Button onClick={handleChangePassword} variant="contained" color="primary">
                        Cambia Password
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Cancellazione Account */}
            <Dialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)}>
                <DialogTitle>Conferma Cancellazione Account</DialogTitle>
                <DialogContent>
                    <Typography>
                        Sei sicuro di voler cancellare il tuo account? Questa azione non può essere annullata.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAccountOpen(false)}>Annulla</Button>
                    <Button onClick={handleDeleteAccount} variant="contained" color="error">
                        Cancella Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Modifica Predizione */}
            <Dialog open={editPredictionOpen} onClose={() => setEditPredictionOpen(false)}>
                <DialogTitle>Modifica Predizione</DialogTitle>
                <DialogContent>
                    {selectedPrediction && (
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label="Gara"
                                value={selectedPrediction.race}
                                onChange={(e) => setSelectedPrediction({...selectedPrediction, race: e.target.value})}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Pilota"
                                value={selectedPrediction.driver}
                                onChange={(e) => setSelectedPrediction({...selectedPrediction, driver: e.target.value})}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Posizione"
                                type="number"
                                value={selectedPrediction.position}
                                onChange={(e) => setSelectedPrediction({...selectedPrediction, position: e.target.value})}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Note"
                                value={selectedPrediction.notes}
                                onChange={(e) => setSelectedPrediction({...selectedPrediction, notes: e.target.value})}
                                margin="normal"
                                multiline
                                rows={4}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditPredictionOpen(false)}>Annulla</Button>
                    <Button onClick={handleUpdatePrediction} variant="contained" color="primary">
                        Salva Modifiche
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserDashboard; 