import axios from 'axios';
import { connessioneDb } from '../../db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fetchTeamData() {
    try {
        // Recupera i dati dei team da OpenF1
        const response = await axios.get('https://api.openf1.org/v1/teams');
        return response.data;
    } catch (error) {
        console.error('Errore nel recupero dei dati dei team:', error);
        throw error;
    }
}

async function processTeamData(teams) {
    // Rimuove i duplicati basandosi sul team_id
    const uniqueTeams = Array.from(new Map(teams.map(team => [team.team_id, team])).values());
    
    return uniqueTeams.map(team => ({
        team_id: team.team_id,
        name: team.name,
        color: team.color,
        stats: {
            points: 0,
            wins: 0,
            podiums: 0,
            fastest_laps: 0,
            constructors_championships: 0
        },
        drivers: [],
        last_updated: new Date()
    }));
}

async function updateTeamStats(db, teams) {
    const driversCollection = db.collection('Drivers');
    const teamsCollection = db.collection('Teams');
    
    for (const team of teams) {
        // Recupera i piloti del team
        const teamDrivers = await driversCollection.find({ team_name: team.name }).toArray();
        const driverIds = teamDrivers.map(driver => driver.driver_id);
        
        // Aggiorna la lista dei piloti del team
        await teamsCollection.updateOne(
            { team_id: team.team_id },
            { $set: { drivers: driverIds } }
        );
        
        // Calcola le statistiche del team
        const teamStats = teamDrivers.reduce((acc, driver) => {
            acc.points += driver.stats.points || 0;
            acc.wins += driver.stats.wins || 0;
            acc.podiums += driver.stats.podiums || 0;
            acc.fastest_laps += driver.stats.fastest_laps || 0;
            return acc;
        }, {
            points: 0,
            wins: 0,
            podiums: 0,
            fastest_laps: 0
        });
        
        // Aggiorna le statistiche del team
        await teamsCollection.updateOne(
            { team_id: team.team_id },
            { 
                $set: {
                    'stats.points': teamStats.points,
                    'stats.wins': teamStats.wins,
                    'stats.podiums': teamStats.podiums,
                    'stats.fastest_laps': teamStats.fastest_laps,
                    'last_updated': new Date()
                }
            }
        );
    }
}

async function updateTeamsDatabase() {
    let db;
    try {
        db = await connessioneDb();
        const teamsCollection = db.collection('Teams');
        
        // Recupera i dati dei team
        const rawTeams = await fetchTeamData();
        const processedTeams = await processTeamData(rawTeams);
        
        // Aggiorna o inserisce i dati nel database
        for (const team of processedTeams) {
            await teamsCollection.updateOne(
                { team_id: team.team_id },
                { $set: team },
                { upsert: true }
            );
        }
        
        // Aggiorna le statistiche dei team
        await updateTeamStats(db, processedTeams);
        
        console.log('Database dei team aggiornato con successo!');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del database:', error);
    }
}

// Esegui lo script
updateTeamsDatabase(); 