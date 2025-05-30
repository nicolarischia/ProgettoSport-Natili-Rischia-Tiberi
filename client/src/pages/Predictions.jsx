import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    TextField, 
    Button, 
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function Predictions() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [prediction, setPrediction] = useState({
        race: '',
        driver: '',
        position: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userPredictions, setUserPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Se l'utente non è autenticato, reindirizza al login
    if (!user) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        fetchUserPredictions();
    }, []);

    const fetchUserPredictions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/predictions/my-predictions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Errore nel recupero delle predizioni');
            }

            const data = await response.json();
            setUserPredictions(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...prediction,
                    userId: user.id
                })
            });

            if (!response.ok) {
                throw new Error('Errore nel salvataggio della predizione');
            }

            setSuccess('Predizione salvata con successo!');
            setPrediction({
                race: '',
                driver: '',
                position: '',
                notes: ''
            });
            fetchUserPredictions(); // Aggiorna la lista delle predizioni
        } catch (err) {
            setError(err.message);
        }
    };

    // Prepara i dati per i grafici
    const prepareChartData = () => {
        // Raggruppa le predizioni per pilota
        const driverPredictions = userPredictions.reduce((acc, pred) => {
            acc[pred.driver] = (acc[pred.driver] || 0) + 1;
            return acc;
        }, {});

        // Raggruppa le predizioni per posizione
        const positionPredictions = userPredictions.reduce((acc, pred) => {
            acc[pred.position] = (acc[pred.position] || 0) + 1;
            return acc;
        }, {});

        return {
            driverData: {
                labels: Object.keys(driverPredictions),
                datasets: [{
                    label: 'Predizioni per Pilota',
                    data: Object.values(driverPredictions),
                    backgroundColor: [
                        '#E10600',
                        '#1E1E1E',
                        '#333333',
                        '#666666',
                        '#999999'
                    ]
                }]
            },
            positionData: {
                labels: Object.keys(positionPredictions).map(pos => `${pos}° posto`),
                datasets: [{
                    label: 'Predizioni per Posizione',
                    data: Object.values(positionPredictions),
                    backgroundColor: '#E10600'
                }]
            }
        };
    };

    const chartData = prepareChartData();

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Analisi Predizioni'
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {/* Form per inserire nuove predizioni */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--f1-white)' }}>
                            Inserisci la tua predizione
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Gara</InputLabel>
                                        <Select
                                            value={prediction.race}
                                            label="Gara"
                                            onChange={(e) => setPrediction({...prediction, race: e.target.value})}
                                            required
                                        >
                                            <MenuItem value="monaco">Gran Premio di Monaco</MenuItem>
                                            <MenuItem value="monza">Gran Premio d'Italia</MenuItem>
                                            <MenuItem value="spa">Gran Premio del Belgio</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Pilota</InputLabel>
                                        <Select
                                            value={prediction.driver}
                                            label="Pilota"
                                            onChange={(e) => setPrediction({...prediction, driver: e.target.value})}
                                            required
                                        >
                                            <MenuItem value="verstappen">Max Verstappen</MenuItem>
                                            <MenuItem value="hamilton">Lewis Hamilton</MenuItem>
                                            <MenuItem value="leclerc">Charles Leclerc</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Posizione</InputLabel>
                                        <Select
                                            value={prediction.position}
                                            label="Posizione"
                                            onChange={(e) => setPrediction({...prediction, position: e.target.value})}
                                            required
                                        >
                                            {[...Array(20)].map((_, i) => (
                                                <MenuItem key={i + 1} value={i + 1}>{i + 1}°</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label="Note aggiuntive"
                                multiline
                                rows={4}
                                value={prediction.notes}
                                onChange={(e) => setPrediction({...prediction, notes: e.target.value})}
                                sx={{ mb: 3 }}
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth
                                sx={{
                                    backgroundColor: 'var(--f1-red)',
                                    '&:hover': {
                                        backgroundColor: 'var(--f1-black)',
                                    },
                                }}
                            >
                                Salva Predizione
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Visualizzazione predizioni esistenti */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--f1-white)' }}>
                            Le tue predizioni
                        </Typography>

                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                <CircularProgress />
                            </Box>
                        ) : userPredictions.length === 0 ? (
                            <Alert severity="info">Non hai ancora fatto nessuna predizione</Alert>
                        ) : (
                            <>
                                {/* Grafici */}
                                <Box sx={{ mb: 4 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Predizioni per Pilota
                                                </Typography>
                                                <Pie data={chartData.driverData} options={chartOptions} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Predizioni per Posizione
                                                </Typography>
                                                <Bar data={chartData.positionData} options={chartOptions} />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Tabella predizioni */}
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Gara</TableCell>
                                                <TableCell>Pilota</TableCell>
                                                <TableCell>Posizione</TableCell>
                                                <TableCell>Note</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {userPredictions.map((pred) => (
                                                <TableRow key={pred._id}>
                                                    <TableCell>{pred.race}</TableCell>
                                                    <TableCell>{pred.driver}</TableCell>
                                                    <TableCell>{pred.position}°</TableCell>
                                                    <TableCell>{pred.notes}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Predictions; 