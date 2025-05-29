import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import AdminSidebar from '../../components/AdminSidebar';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getDrivers, getRaces, getTeams } from '../../services/api';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        races: 0,
        drivers: 0,
        teams: 0,
        predictions: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                // Usa i servizi API come nella Dashboard principale
                const [driversData, racesData, teamsData, predictionsData] = await Promise.all([
                    getDrivers(),
                    getRaces(),
                    getTeams(),
                    axios.get('http://localhost:5000/api/predictions', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                // Filtra le gare per il 2024
                const currentYearRaces = racesData.filter(race => new Date(race.date).getFullYear() === 2024);

                setStats({
                    races: currentYearRaces.length,
                    drivers: driversData.length,
                    teams: teamsData.length,
                    predictions: predictionsData.data.length
                });
            } catch (error) {
                console.error('Errore nel recupero delle statistiche:', error);
            }
        };

        fetchStats();
    }, []);

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
                <Typography variant="h4" gutterBottom sx={{ color: 'var(--f1-white)', mb: 4 }}>
                    Admin Dashboard
                </Typography>

                <Grid container spacing={3}>
                    {/* Statistiche Generali */}
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SpeedIcon sx={{ color: 'var(--f1-red)', mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: 'var(--f1-white)' }}>
                                        Ultime Gare
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ color: 'var(--f1-white)' }}>
                                    {stats.races}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PeopleIcon sx={{ color: 'var(--f1-red)', mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: 'var(--f1-white)' }}>
                                        Piloti Attivi
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ color: 'var(--f1-white)' }}>
                                    {stats.drivers}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <GroupsIcon sx={{ color: 'var(--f1-red)', mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: 'var(--f1-white)' }}>
                                        Team
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ color: 'var(--f1-white)' }}>
                                    {stats.teams}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmojiEventsIcon sx={{ color: 'var(--f1-red)', mr: 1 }} />
                                    <Typography variant="h6" sx={{ color: 'var(--f1-white)' }}>
                                        Predizioni Totali
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ color: 'var(--f1-white)' }}>
                                    {stats.predictions}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sezione Informazioni */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: 'var(--f1-black)', border: '1px solid var(--f1-red)' }}>
                            <Typography variant="h5" sx={{ color: 'var(--f1-white)', mb: 2 }}>
                                Benvenuto nel Pannello di Amministrazione
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--f1-white)', mb: 2 }}>
                                Da qui puoi gestire tutti gli aspetti dell'applicazione:
                            </Typography>
                            <ul style={{ color: 'var(--f1-white)' }}>
                                <li>Gestione dei piloti e dei team</li>
                                <li>Monitoraggio delle predizioni degli utenti</li>
                                <li>Gestione degli utenti e dei permessi</li>
                                <li>Visualizzazione delle statistiche generali</li>
                            </ul>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AdminDashboard; 