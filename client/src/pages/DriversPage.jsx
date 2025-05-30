import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  CircularProgress
} from '@mui/material';
import { getDrivers } from '../services/api';

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(data);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei piloti:', error);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Piloti Formula 1
      </Typography>
      <Grid container spacing={3}>
        {drivers.map((driver) => (
          <Grid item xs={12} sm={6} md={4} key={driver.driver_id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: 6,
                borderColor: driver.team_color || '#E10600'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: driver.team_color || '#E10600',
                      mr: 2
                    }}
                  >
                    {driver.driver_number}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {driver.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {driver.team_name}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Vittorie:</strong> {driver.stats.wins}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Podi:</strong> {driver.stats.podiums}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Punti:</strong> {driver.stats.points}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Giri veloci:</strong> {driver.stats.fastest_laps}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default DriversPage; 