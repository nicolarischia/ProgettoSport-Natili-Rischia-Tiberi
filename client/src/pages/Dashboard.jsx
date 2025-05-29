import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getDrivers, getRaces, getTeams } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [teams, setTeams] = useState([]);
  const [bestTeam, setBestTeam] = useState(null);
  const [targetRace, setTargetRace] = useState(null);
  const [countdown, setCountdown] = useState('Caricamento...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, racesData, teamsData] = await Promise.all([
          getDrivers(),
          getRaces(),
          getTeams()
        ]);
        setDrivers(driversData);
        setRaces(racesData);
        setTeams(teamsData);

        // Trova l'ultima gara passata per il countdown di esempio
        const sortedRaces = racesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sortedRaces.length > 0) {
          setTargetRace(sortedRaces[0]);
        }

        // Calcola il team con più piloti (criterio semplice per "migliore")
        if (driversData.length > 0 && teamsData.length > 0) {
          const teamDriverCounts = {};
          driversData.forEach(driver => {
            if (driver.team && driver.team._id) {
              teamDriverCounts[driver.team._id] = (teamDriverCounts[driver.team._id] || 0) + 1;
            } else if (driver.team && typeof driver.team === 'string') {
              teamDriverCounts[driver.team] = (teamDriverCounts[driver.team] || 0) + 1;
            }
          });

          let maxDrivers = -1;
          let bestTeamData = null;
          teamsData.forEach(team => {
            const driverCount = teamDriverCounts[team._id] || 0;
            if (driverCount > maxDrivers || (maxDrivers === -1 && teamsData.length > 0)) {
              maxDrivers = driverCount > -1 ? driverCount : 0;
              bestTeamData = team;
            }
          });

          if (!bestTeamData && teamsData.length > 0) {
            setBestTeam(teamsData[0]);
          } else {
            setBestTeam(bestTeamData);
          }
        } else if (teamsData.length > 0) {
          setBestTeam(teamsData[0]);
        } else {
          setBestTeam(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!targetRace) return;

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const raceTime = new Date(targetRace.date).getTime();
      let distance = raceTime - now;

      let prefix = '';
      if (distance < 0) {
        prefix = '-';
        distance = Math.abs(distance);
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const formattedCountdown = `${prefix}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

      setCountdown(formattedCountdown);

      if (prefix === '' && distance < 1000) {
        clearInterval(intervalId);
        setCountdown('Gara iniziata!');
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetRace]);

  const performanceData = {
    labels: races.slice(0, 5).map(race => race.name),
    datasets: [
      {
        label: 'Tempi sul giro',
        data: [85.4, 84.9, 85.1, 84.7, 85.2],
        borderColor: '#E10600',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Analisi Prestazioni'
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Countdown target race */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Target Gara:
            </Typography>
            {targetRace ? (
              <Box>
                <Typography variant="body1">{targetRace.circuit_name} - {targetRace.country} ({new Date(targetRace.date).toLocaleDateString()})</Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {countdown}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1">Nessuna gara trovata</Typography>
            )}
          </Paper>
        </Grid>

        {/* Statistiche generali */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Statistiche Generali
            </Typography>
            <Box>
              <Typography>Piloti: {drivers.length}</Typography>
              <Typography>Sessioni: {races.length}</Typography>
              <Typography>Team: {teams.length}</Typography>
            </Box>
          </Paper>
        </Grid>

         {/* Team in Evidenza (Basato sul numero di piloti) */}
        <Grid item xs={12} md={4}>
           {bestTeam && (
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                {bestTeam.logo && (
                    <img src={bestTeam.logo} alt={`${bestTeam.name} logo`} style={{ width: 80, height: 80, marginRight: 16, objectFit: 'contain' }} />
                )}
                <Box>
                    <Typography variant="h6">Team in Evidenza:</Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {bestTeam.name}
                    </Typography>
                </Box>
            </Paper>
           )}
        </Grid>

        {/* Grafico prestazioni */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Line options={options} data={performanceData} />
          </Paper>
        </Grid>

        {/* Classifica piloti */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Classifica Piloti
            </Typography>
            {drivers.slice(0, 5).map((driver, index) => (
              <Box
                key={driver.driver_id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}
              >
                <Typography>
                  {index + 1}. {driver.name}
                </Typography>
                <Typography>{driver.team_name}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 