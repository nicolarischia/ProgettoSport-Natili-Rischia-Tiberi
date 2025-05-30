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
            { userId: user._id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login effettuato con successo',
            token,
            user: {
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
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
        
        // Ottieni i dati delle posizioni
        const positionResponse = await axios.get(`https://api.openf1.org/v1/position?session_key=${sessionId}`);
        
        // Ottieni i dati dei giri
        const lapsResponse = await axios.get(`https://api.openf1.org/v1/laps?session_key=${sessionId}`);
        
        // Calcola i tempi totali per ogni pilota
        const driverTimes = lapsResponse.data.reduce((acc, lap) => {
            if (lap.lap_duration) {
                if (!acc[lap.driver_number]) {
                    acc[lap.driver_number] = 0;
                }
                acc[lap.driver_number] += lap.lap_duration;
            }
            return acc;
        }, {});
        
        // Raggruppa i dati per pilota e ottieni l'ultima posizione di ogni pilota
        const driverResults = positionResponse.data.reduce((acc, position) => {
            if (!acc[position.driver_number] || position.date > acc[position.driver_number].date) {
                // Determina lo stato del pilota
                const status = position.status || 'Finished';
                const isDNF = status.includes('DNF') || status.includes('Retired') || status.includes('Accident');
                
                // Determina il tempo
                let time = '00:00.000';
                if (driverTimes[position.driver_number]) {
                    time = formatTime(driverTimes[position.driver_number]);
                } else if (position.time) {
                    time = formatTime(position.time);
                }

                acc[position.driver_number] = {
                    driver_number: position.driver_number,
                    driver_name: position.driver_name || `Pilota ${position.driver_number}`,
                    team_name: position.team_name || getTeamName(position.driver_number),
                    position: position.position || 0,
                    time: time,
                    gap: '-', // Verrà calcolato dopo
                    points: calculatePoints(position.position || 0),
                    date: position.date,
                    status: status,
                    total_time: driverTimes[position.driver_number] || 0
                };
            }
            return acc;
        }, {});

        // Calcola i gap rispetto al leader
        const resultsArray = Object.values(driverResults).sort((a, b) => a.position - b.position);
        const leaderTime = resultsArray[0]?.total_time || 0;

        // Aggiorna i gap
        resultsArray.forEach((result, index) => {
            if (index === 0) {
                result.gap = '-'; // Il leader non ha gap
            } else if (result.total_time > 0) {
                const gap = result.total_time - leaderTime;
                result.gap = formatTime(gap);
            }
        });
        
        res.json(resultsArray);
    } catch (error) {
        console.error('Errore nel recupero dei risultati della gara:', error);
        res.status(500).json({ error: 'Errore nel recupero dei risultati della gara' });
    }
});

// Funzione per ottenere il nome della scuderia in base al numero del pilota
function getTeamName(driverNumber) {
    const teamMap = {
        1: 'Red Bull Racing',
        2: 'Red Bull Racing',
        3: 'McLaren',
        4: 'McLaren',
        5: 'Aston Martin',
        6: 'Aston Martin',
        10: 'Alpine',
        11: 'Alpine',
        14: 'Aston Martin',
        16: 'Williams',
        18: 'Aston Martin',
        20: 'Haas F1 Team',
        21: 'Haas F1 Team',
        22: 'AlphaTauri',
        23: 'Williams',
        27: 'Haas F1 Team',
        31: 'Alpine',
        44: 'Mercedes',
        55: 'Ferrari',
        63: 'Mercedes',
        77: 'Alfa Romeo',
        81: 'McLaren',
        87: 'Williams'
    };
    return teamMap[driverNumber] || 'Scuderia non specificata';
}

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
            userId: new ObjectId(userId), // Converti l'ID utente in ObjectId
            race,
            driver,
            position,
            notes,
            createdAt: new Date()
        };

        const result = await db.collection('predictions').insertOne(prediction);
        res.status(201).json({ ...prediction, _id: result.insertedId });
    } catch (error) {
        console.error('Errore nel salvataggio della predizione:', error);
        res.status(500).json({ error: 'Errore nel salvataggio della predizione' });
    }
});

// Ottieni tutte le predizioni dell'utente
app.get('/api/predictions/my-predictions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Recupero predizioni per userId:', userId);

        // Converti l'ID utente in ObjectId
        const userObjectId = new ObjectId(userId);
        console.log('ObjectId convertito:', userObjectId);

        const predictions = await db.collection('predictions')
            .find({ userId: userObjectId })
            .sort({ createdAt: -1 })
            .toArray();

        console.log('Predizioni trovate:', predictions.length);
        res.json(predictions);
    } catch (error) {
        console.error('Errore dettagliato nel recupero delle predizioni:', error);
        res.status(500).json({ 
            error: 'Errore nel recupero delle predizioni',
            details: error.message 
        });
    }
});

// Ottieni una predizione specifica
app.get('/api/predictions/:id', authenticateToken, async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const predictionId = new ObjectId(req.params.id);

        const prediction = await db.collection('predictions').findOne({
            _id: predictionId,
            userId: userId
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
        const userId = new ObjectId(req.user.userId);
        const predictionId = new ObjectId(req.params.id);

        const result = await db.collection('predictions').findOneAndUpdate(
            {
                _id: predictionId,
                userId: userId
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
        const userId = new ObjectId(req.user.userId);
        const predictionId = new ObjectId(req.params.id);

        const result = await db.collection('predictions').findOneAndDelete({
            _id: predictionId,
            userId: userId
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

// Endpoint per ottenere tutti gli utenti (solo per admin)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        const users = await db.collection('users').find(
            {},
            { projection: { password: 0 } } // Esclude la password dalla risposta
        ).toArray();

        res.json(users);
    } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ error: 'Errore nel recupero degli utenti' });
    }
});

// Endpoint per aggiornare un utente (solo per admin)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        const { username, email, isAdmin } = req.body;
        const userId = new ObjectId(req.params.id);

        // Verifica se l'email è già in uso da un altro utente
        const existingUser = await db.collection('users').findOne({
            email,
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email già in uso' });
        }

        // Aggiorna l'utente
        const result = await db.collection('users').findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    username,
                    email,
                    isAdmin,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = result.value;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
        res.status(500).json({ error: 'Errore nell\'aggiornamento dell\'utente' });
    }
});

// Endpoint per eliminare un utente (solo per admin)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        const userId = new ObjectId(req.params.id);

        // Non permettere l'eliminazione dell'utente admin principale
        const user = await db.collection('users').findOne({ _id: userId });
        if (user && user.email === 'admin@formula1.com') {
            return res.status(403).json({ error: 'Non è possibile eliminare l\'utente admin principale' });
        }

        // Elimina l'utente
        const result = await db.collection('users').findOneAndDelete({ _id: userId });

        if (!result.value) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Elimina anche le predizioni dell'utente
        await db.collection('predictions').deleteMany({ userId: userId });

        res.json({ message: 'Utente eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione dell\'utente' });
    }
});

// Endpoint per ottenere tutte le predizioni (solo per admin)
app.get('/api/predictions', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        // Recupera tutte le predizioni con i dettagli degli utenti
        const predictions = await db.collection('predictions')
            .aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        _id: 1,
                        race: 1,
                        driver: 1,
                        position: 1,
                        notes: 1,
                        createdAt: 1,
                        'user.username': 1,
                        'user.email': 1
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]).toArray();

        res.json(predictions);
    } catch (error) {
        console.error('Errore nel recupero delle predizioni:', error);
        res.status(500).json({ error: 'Errore nel recupero delle predizioni' });
    }
});

// Endpoint per aggiungere un nuovo pilota
app.post('/api/drivers', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        const { 
            driver_id, 
            driver_number, 
            name, 
            team_name, 
            team_color, 
            stats // Rimuovi nationality e date_of_birth
        } = req.body;

        // Crea il nuovo pilota
        const newDriver = {
            // _id verrà generato automaticamente da MongoDB se non specificato
            driver_id: parseInt(driver_id) || null, // Assicurati che sia un numero
            driver_number: parseInt(driver_number) || null,
            name,
            team_name,
            team_color,
            stats: {
                points: parseInt(stats?.points) || 0,
                wins: parseInt(stats?.wins) || 0,
                podiums: parseInt(stats?.podiums) || 0,
                fastest_laps: parseInt(stats?.fastest_laps) || 0,
                // avg_position non è nel frontend, lo impostiamo di default o lo gestiamo diversamente se necessario
                avg_position: parseFloat(stats?.avg_position) || 0
            },
            last_updated: new Date()
        };

        // Inserisci il nuovo pilota
        const result = await db.collection('Drivers').insertOne(newDriver);

        // Restituisci il pilota inserito con l'_id generato
        res.status(201).json({ ...newDriver, _id: result.insertedId });
    } catch (error) {
        console.error('Errore nell\'aggiunta del pilota:', error);
        res.status(500).json({ error: 'Errore nell\'aggiunta del pilota' });
    }
});

// Endpoint per modificare un pilota esistente
app.put('/api/drivers/:id', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        // Usa driver_id dall'URL e convertilo in numero
        const driverId = parseInt(req.params.id);
        console.log('ID pilota ricevuto:', driverId);

        // Verifica se l'ID è un numero valido
        if (isNaN(driverId)) {
            return res.status(400).json({ error: 'ID pilota non valido' });
        }

        const { 
            driver_number, 
            name, 
            team_name, 
            team_color, 
            stats
        } = req.body;

        console.log('Dati ricevuti:', req.body);

        // Costruisci l'oggetto di aggiornamento
        const updateData = {
            driver_number: parseInt(driver_number) || null,
            name,
            team_name,
            team_color,
            last_updated: new Date()
        };

        // Aggiungi o aggiorna i campi stats se presenti
        if (stats) {
            updateData.stats = {
                points: parseInt(stats.points) || 0,
                wins: parseInt(stats.wins) || 0,
                podiums: parseInt(stats.podiums) || 0,
                fastest_laps: parseInt(stats.fastest_laps) || 0,
                avg_position: parseFloat(stats.avg_position) || 0
            };
        }

        console.log('Dati di aggiornamento:', updateData);

        // Prima verifica se il pilota esiste
        const existingDriver = await db.collection('Drivers').findOne({ driver_id: driverId });
        console.log('Pilota esistente:', existingDriver);

        if (!existingDriver) {
            return res.status(404).json({ error: 'Pilota non trovato' });
        }

        // Trova e aggiorna il pilota per driver_id
        const result = await db.collection('Drivers').findOneAndUpdate(
            { driver_id: driverId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Errore nell\'aggiornamento del pilota' });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Errore nella modifica del pilota:', error);
        res.status(500).json({ error: 'Errore nella modifica del pilota' });
    }
});

// Endpoint per eliminare un pilota esistente
app.delete('/api/drivers/:id', authenticateToken, async (req, res) => {
    try {
        // Verifica che l'utente sia admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        // Usa driver_id dall'URL e convertilo in numero
        const driverId = parseInt(req.params.id);

         // Verifica se l'ID è un numero valido
         if (isNaN(driverId)) {
            return res.status(400).json({ error: 'ID pilota non valido' });
        }

        // Trova ed elimina il pilota per driver_id
        const result = await db.collection('Drivers').findOneAndDelete(
            { driver_id: driverId } // Cerca per driver_id
        );

        if (!result.value) {
            return res.status(404).json({ error: 'Pilota non trovato' });
        }

        res.json({ message: 'Pilota eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione del pilota:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione del pilota' });
    }
});

app.listen(port, async () => {
    try {
        db = await connessioneDb();
        
        // Crea l'utente admin se non esiste
        const adminExists = await db.collection('users').findOne({ email: 'admin@formula1.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await db.collection('users').insertOne({
                username: 'admin',
                email: 'admin@formula1.com',
                password: hashedPassword,
                isAdmin: true,
                createdAt: new Date(),
                favorites: {
                    drivers: [],
                    races: []
                }
            });
            console.log('Utente admin creato con successo');
        }
        
        console.log(`Server in esecuzione sulla porta ${port}`);
    } catch (error) {
        console.error('Errore durante l\'avvio del server:', error);
        process.exit(1);
    }
});