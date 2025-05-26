import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connessioneDb } from './db.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import teamRoutes from './routes/teamRoutes.js';
import Driver from './models/Driver.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

let db;

// Middleware per verificare il token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token non fornito' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token non valido' });
        }
        req.user = user;
        next();
    });
};

// Endpoint per la registrazione
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verifica se l'utente esiste già
        const existingUser = await db.collection('users').findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: 'Email o username già in uso' 
            });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea il nuovo utente
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            favorites: {
                drivers: [],
                races: []
            }
        };

        await db.collection('users').insertOne(newUser);

        // Genera il token JWT
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registrazione completata con successo',
            token,
            user: {
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ error: 'Errore durante la registrazione' });
    }
});

// Endpoint per il login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trova l'utente
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Verifica la password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Genera il token JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login effettuato con successo',
            token,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
});

// Endpoint per ottenere il profilo utente
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        // Converti l'userId da stringa a ObjectId
        const userId = new ObjectId(req.user.userId);
        
        const user = await db.collection('users').findOne(
            { _id: userId },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        res.json(user);
    } catch (error) {
        console.error('Errore nel recupero del profilo:', error);
        // Aggiungi un controllo specifico per errori di formato ObjectId
        if (error.message.includes('ObjectId')) {
             res.status(400).json({ error: 'ID utente non valido' });
        } else {
            res.status(500).json({ error: 'Errore nel recupero del profilo' });
        }
    }
});

// Endpoint base
app.get('/', (req, res) => {
    res.json({ message: 'F1 Analytics API' });
});

// Endpoint per ottenere i dati dei piloti
app.get('/api/drivers', async (req, res) => {
    try {
        const drivers = await db.collection('Drivers').find().toArray();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei piloti' });
    }
});

// Endpoint per ottenere i dati delle gare dalla API OpenF1
app.get('/api/races', async (req, res) => {
    try {
        const response = await axios.get('https://api.openf1.org/v1/sessions');
        // Formatta i dati delle gare
        const formattedRaces = response.data.map(race => ({
            session_key: race.session_key,
            date: race.date_start, // Usa la data di inizio della sessione
            circuit_name: race.circuit_short_name || 'Circuito non specificato',
            session_type: race.session_name || 'Sessione non specificata',
            country: race.country_name || 'Paese non specificato',
            year: race.year
        }));
        
        // Ordina le gare per data, dalla più recente
        const sortedRaces = formattedRaces.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(sortedRaces);
    } catch (error) {
        console.error('Errore nel recupero delle gare:', error);
        res.status(500).json({ error: 'Errore nel recupero delle gare' });
    }
});

// Endpoint per ottenere i dati dei tempi sul giro
app.get('/api/laptimes/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const response = await axios.get(`https://api.openf1.org/v1/laps?session_key=${sessionId}`);
        
        // Formatta i dati dei tempi sul giro
        const formattedLapTimes = response.data
            .filter(lap => lap.lap_duration) // Filtra solo i giri con un tempo valido
            .map(lap => ({
                lap_number: lap.lap_number,
                lap_time: lap.lap_duration,
                driver_number: lap.driver_number,
                compound: lap.compound || 'Non specificato'
            }))
            .sort((a, b) => a.lap_number - b.lap_number); // Ordina per numero del giro
        
        res.json(formattedLapTimes);
    } catch (error) {
        console.error('Errore nel recupero dei tempi sul giro:', error);
        res.status(500).json({ error: 'Errore nel recupero dei tempi sul giro' });
    }
});

// Endpoint per le statistiche dei piloti
app.get('/api/driver-stats/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        const driver = await db.collection('Drivers').findOne({ driver_id: parseInt(driverId) });
        if (!driver) {
            return res.status(404).json({ error: 'Pilota non trovato' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero delle statistiche del pilota' });
    }
});

// Endpoint per ottenere i risultati delle gare
app.get('/api/race-results/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const response = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionId}`);
        
        // Formatta i dati dei risultati
        const formattedResults = response.data
            .filter(result => result.position) // Filtra solo i risultati con una posizione valida
            .map(result => ({
                driver_number: result.driver_number,
                driver_name: result.driver_name || `Pilota ${result.driver_number}`,
                team_name: result.team_name || 'Scuderia non specificata',
                position: result.position,
                time: result.time ? formatTime(result.time) : 'DNF',
                gap: result.gap || '-',
                points: calculatePoints(result.position)
            }))
            .sort((a, b) => a.position - b.position); // Ordina per posizione
        
        res.json(formattedResults);
    } catch (error) {
        console.error('Errore nel recupero dei risultati della gara:', error);
        res.status(500).json({ error: 'Errore nel recupero dei risultati della gara' });
    }
});

// Rotte per i team
app.use('/api/teams', teamRoutes);

// Funzione per formattare il tempo in formato mm:ss.SSS
function formatTime(seconds) {
    if (!seconds) return '00:00.000';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const wholeSeconds = Math.floor(remainingSeconds);
    const milliseconds = Math.round((remainingSeconds - wholeSeconds) * 1000);

    return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Funzione per calcolare i punti in base alla posizione
function calculatePoints(position) {
    const pointsSystem = {
        1: 25,
        2: 18,
        3: 15,
        4: 12,
        5: 10,
        6: 8,
        7: 6,
        8: 4,
        9: 2,
        10: 1
    };
    return pointsSystem[position] || 0;
}

// Endpoint per le predizioni
app.post('/api/predictions', authenticateToken, async (req, res) => {
    try {
        const { race, driver, position, notes } = req.body;
        const userId = req.user.userId;

        const prediction = {
            userId,
            race,
            driver,
            position,
            notes,
            createdAt: new Date()
        };

        await db.collection('predictions').insertOne(prediction);
        res.status(201).json(prediction);
    } catch (error) {
        console.error('Errore nel salvataggio della predizione:', error);
        res.status(500).json({ error: 'Errore nel salvataggio della predizione' });
    }
});

// Ottieni tutte le predizioni dell'utente
app.get('/api/predictions/my-predictions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const predictions = await db.collection('predictions')
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(predictions);
    } catch (error) {
        console.error('Errore nel recupero delle predizioni:', error);
        res.status(500).json({ error: 'Errore nel recupero delle predizioni' });
    }
});

// Ottieni una predizione specifica
app.get('/api/predictions/:id', authenticateToken, async (req, res) => {
    try {
        const prediction = await db.collection('predictions').findOne({
            _id: new ObjectId(req.params.id),
            userId: req.user.userId
        });

        if (!prediction) {
            return res.status(404).json({ error: 'Predizione non trovata' });
        }

        res.json(prediction);
    } catch (error) {
        console.error('Errore nel recupero della predizione:', error);
        res.status(500).json({ error: 'Errore nel recupero della predizione' });
    }
});

// Aggiorna una predizione
app.put('/api/predictions/:id', authenticateToken, async (req, res) => {
    try {
        const { race, driver, position, notes } = req.body;
        const result = await db.collection('predictions').findOneAndUpdate(
            {
                _id: new ObjectId(req.params.id),
                userId: req.user.userId
            },
            {
                $set: {
                    race,
                    driver,
                    position,
                    notes,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Predizione non trovata' });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Errore nell\'aggiornamento della predizione:', error);
        res.status(500).json({ error: 'Errore nell\'aggiornamento della predizione' });
    }
});

// Elimina una predizione
app.delete('/api/predictions/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.collection('predictions').findOneAndDelete({
            _id: new ObjectId(req.params.id),
            userId: req.user.userId
        });

        if (!result.value) {
            return res.status(404).json({ error: 'Predizione non trovata' });
        }

        res.json({ message: 'Predizione eliminata con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione della predizione:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione della predizione' });
    }
});

// Endpoint per la cancellazione dell'account
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);

        // Elimina l'utente dal database
        const result = await db.collection('users').deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Opzionale: Potresti voler eliminare anche altri dati associati all'utente (predizioni, preferiti, ecc.) qui.
        // await db.collection('predictions').deleteMany({ userId: userId });
        // await db.collection('favorites').deleteMany({ userId: userId });

        res.json({ message: 'Account eliminato con successo' });
    } catch (error) {
        console.error('Errore nella cancellazione dell\'account:', error);
        res.status(500).json({ error: 'Errore nella cancellazione dell\'account' });
    }
});

// Endpoint per il cambio password
app.post('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = new ObjectId(req.user.userId);

        // Trova l'utente
        const user = await db.collection('users').findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Verifica la password attuale
        const validPassword = await bcrypt.compare(currentPassword, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Password attuale non corretta' });
        }

        // Hash della nuova password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Aggiorna la password nel DB
        await db.collection('users').updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        res.json({ message: 'Password aggiornata con successo' });
    } catch (error) {
        console.error('Errore nel cambio password:', error);
        res.status(500).json({ error: 'Errore nel cambio password' });
    }
});

app.listen(port, async () => {
    try {
        db = await connessioneDb();
        console.log(`Server in esecuzione sulla porta ${port}`);
    } catch (error) {
        console.error('Errore durante l\'avvio del server:', error);
        process.exit(1);
    }
}); 