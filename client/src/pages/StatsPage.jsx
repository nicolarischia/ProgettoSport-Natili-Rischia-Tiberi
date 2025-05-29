import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getDrivers } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StatsPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driversData = await getDrivers();
        setDrivers(driversData);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pointsChartData = {
    labels: drivers.map(driver => driver.name),
    datasets: [
      {
        label: 'Punti',
        data: drivers.map(driver => driver.stats.points),
        backgroundColor: '#E10600',
      }
    ]
  };

  const winsChartData = {
    labels: drivers.map(driver => driver.name),
    datasets: [
      {
        label: 'Vittorie',
        data: drivers.map(driver => driver.stats.wins),
        backgroundColor: '#1E1E1E',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Calcola le statistiche medie
  const averageStats = drivers.reduce((acc, driver) => {
    acc.points += driver.stats.points;
    acc.wins += driver.stats.wins;
    acc.podiums += driver.stats.podiums;
    acc.fastestLaps += driver.stats.fastest_laps;
    return acc;
  }, { points: 0, wins: 0, podiums: 0, fastestLaps: 0 });

  const driverCount = drivers.length;
  Object.keys(averageStats).forEach(key => {
    averageStats[key] = (averageStats[key] / driverCount).toFixed(2);
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Statistiche Campionato
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiche medie */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistiche Medie per Pilota
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Punti medi</TableCell>
                    <TableCell align="right">{averageStats.points}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vittorie medie</TableCell>
                    <TableCell align="right">{averageStats.wins}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Podi medi</TableCell>
                    <TableCell align="right">{averageStats.podiums}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Giri veloci medi</TableCell>
                    <TableCell align="right">{averageStats.fastestLaps}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Grafico punti */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribuzione Punti
            </Typography>
            <Bar options={chartOptions} data={pointsChartData} />
          </Paper>
        </Grid>

        {/* Grafico vittorie */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribuzione Vittorie
            </Typography>
            <Bar options={chartOptions} data={winsChartData} />
          </Paper>
        </Grid>

        {/* Tabella completa statistiche */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Statistiche Dettagliate
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pilota</TableCell>
                    <TableCell align="right">Punti</TableCell>
                    <TableCell align="right">Vittorie</TableCell>
                    <TableCell align="right">Podi</TableCell>
                    <TableCell align="right">Giri Veloci</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.driver_id}>
                      <TableCell component="th" scope="row">
                        {driver.name}
                      </TableCell>
                      <TableCell align="right">{driver.stats.points}</TableCell>
                      <TableCell align="right">{driver.stats.wins}</TableCell>
                      <TableCell align="right">{driver.stats.podiums}</TableCell>
                      <TableCell align="right">{driver.stats.fastest_laps}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default StatsPage; 