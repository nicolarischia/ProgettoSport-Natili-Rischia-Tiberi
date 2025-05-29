import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
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
import { getRaces, getLapTimes, getRaceResults } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RacesPage() {
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [lapTimes, setLapTimes] = useState([]);
  const [raceResults, setRaceResults] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  
  // Nuovi stati per i filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Funzione per formattare i tempi sul giro in formato mm:ss.SSS
  const formatLapTime = (seconds) => {
    if (!seconds) return '00:00.000';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const wholeSeconds = Math.floor(remainingSeconds);
    const milliseconds = Math.round((remainingSeconds - wholeSeconds) * 1000);

    return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const data = await getRaces();
        setRaces(data);
        setFilteredRaces(data);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento delle gare:', error);
        setError('Errore nel caricamento delle gare');
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  // Funzione per filtrare le gare
  useEffect(() => {
    let filtered = [...races];

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(race => 
        race.circuit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        race.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro per tipo sessione
    if (sessionType) {
      filtered = filtered.filter(race => race.session_type === sessionType);
    }

    // Filtro per anno
    if (selectedYear) {
      filtered = filtered.filter(race => {
        try {
          const raceDate = new Date(race.date);
          const raceYear = raceDate.getFullYear();
          return raceYear === parseInt(selectedYear);
        } catch (error) {
          console.error('Errore nella conversione della data:', error);
          return false;
        }
      });
    }

    setFilteredRaces(filtered);
  }, [searchTerm, sessionType, selectedYear, races]);

  // Ottieni anni unici dalle gare
  const getUniqueYears = () => {
    const years = new Set();
    races.forEach(race => {
      try {
        const year = new Date(race.date).getFullYear();
        if (!isNaN(year)) {
          years.add(year);
        }
      } catch (error) {
        console.error('Errore nella conversione della data:', error);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  // Ottieni tipi di sessione unici
  const getUniqueSessionTypes = () => {
    const types = new Set(races.map(race => race.session_type));
    return Array.from(types);
  };

  const handleSessionClick = async (session) => {
    try {
      setSelectedSession(session);
      setDialogOpen(true);
      const [lapTimesData, resultsData] = await Promise.all([
        getLapTimes(session.session_key),
        getRaceResults(session.session_key)
      ]);
      
      if (lapTimesData.length === 0) {
        setError('Nessun dato disponibile per questa sessione');
      } else {
        setLapTimes(lapTimesData);
        // Formatta i risultati della gara
        const formattedResults = resultsData.map(result => ({
          ...result,
          team_name: result.team_name || 'Scuderia non specificata',
          race_time: result.race_time || (result.status === 'DNF' ? 'DNF' : 'N/A'),
          gap: result.gap || '-',
          points: result.points || 0
        }));
        setRaceResults(formattedResults);
        setError(null);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setError('Errore nel caricamento dei dati');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data non disponibile';
    }
  };

  const chartData = {
    labels: lapTimes.map(lap => `Giro ${lap.lap_number}`),
    datasets: [
      {
        label: 'Tempo sul giro',
        data: lapTimes.map(lap => lap.lap_time),
        borderColor: '#E10600',
        backgroundColor: 'rgba(225, 6, 0, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Analisi Tempi sul Giro'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const lapTime = context.raw;
            return `Tempo: ${formatLapTime(lapTime)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Tempo'
        },
        ticks: {
          callback: (value) => formatLapTime(value)
        }
      },
      x: {
        title: {
          display: true,
          text: 'Numero del giro'
        }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Calendario Gare
      </Typography>
      
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Filtra Gare
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cerca circuito o paese"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo Sessione</InputLabel>
              <Select
                value={sessionType}
                label="Tipo Sessione"
                onChange={(e) => setSessionType(e.target.value)}
              >
                <MenuItem value="">Tutti</MenuItem>
                {getUniqueSessionTypes().map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Anno</InputLabel>
              <Select
                value={selectedYear}
                label="Anno"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="">Tutti</MenuItem>
                {getUniqueYears().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Circuito</TableCell>
              <TableCell>Paese</TableCell>
              <TableCell>Tipo Sessione</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRaces.map((race) => (
              <TableRow key={race.session_key}>
                <TableCell>{formatDate(race.date)}</TableCell>
                <TableCell>{race.circuit_name}</TableCell>
                <TableCell>{race.country}</TableCell>
                <TableCell>{race.session_type}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleSessionClick(race)}
                  >
                    Visualizza Dettagli
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setError(null);
          setLapTimes([]);
          setRaceResults([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSession && `Analisi Gara - ${selectedSession.circuit_name}`}
        </DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : lapTimes.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Line data={chartData} options={chartOptions} />
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Risultati Gara
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Pos.</TableCell>
                        <TableCell>N°</TableCell>
                        <TableCell>Pilota</TableCell>
                        <TableCell>Scuderia</TableCell>
                        <TableCell>Tempo</TableCell>
                        <TableCell>Gap</TableCell>
                        <TableCell>Punti</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {raceResults.slice(0, 20).map((result, index) => (
                        <TableRow key={result.driver_number}>
                          <TableCell>{result.position}</TableCell>
                          <TableCell>{result.driver_number}</TableCell>
                          <TableCell>{result.driver_name}</TableCell>
                          <TableCell>{result.team_name}</TableCell>
                          <TableCell>
                            {result.time === 'DNF' ? (
                              <Typography color="error">DNF</Typography>
                            ) : (
                              result.time
                            )}
                          </TableCell>
                          <TableCell>{result.gap}</TableCell>
                          <TableCell>{result.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  * I tempi sono mostrati nel formato minuti:secondi.millisecondi
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default RacesPage; 