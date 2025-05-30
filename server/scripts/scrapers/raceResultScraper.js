import axios from 'axios';
import { connessioneDb } from '../../db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fetchRaceResults() {
    try {
        // Recupera i risultati delle gare da OpenF1
        const response = await axios.get('https://api.openf1.org/v1/race_results');
        return response.data;
    } catch (error) {
        console.error('Errore nel recupero dei risultati delle gare:', error);
        throw error;
    }
}

async function processRaceResults(results) {
    return results.map(result => ({
        race_id: result.race_id,
        driver_id: result.driver_id,
        position: result.position,
        points: result.points,
        fastest_lap: result.fastest_lap,
        fastest_lap_time: result.fastest_lap_time,
        status: result.status,
        grid_position: result.grid_position,
        race_date: new Date(result.race_date),
        last_updated: new Date()
    }));
}

async function updateRaceResultsDatabase() {
    let db;
    try {
        db = await connessioneDb();
        const resultsCollection = db.collection('RaceResults');
        
        // Recupera i risultati delle gare
        const rawResults = await fetchRaceResults();
        const processedResults = await processRaceResults(rawResults);
        
        // Aggiorna o inserisce i dati nel database
        for (const result of processedResults) {
            await resultsCollection.updateOne(
                { 
                    race_id: result.race_id,
                    driver_id: result.driver_id 
                },
                { $set: result },
                { upsert: true }
            );
        }
        
        // Aggiorna le statistiche dei piloti
        await updateDriverStats(db, processedResults);
        
        console.log('Database dei risultati delle gare aggiornato con successo!');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del database:', error);
    }
}

async function updateDriverStats(db, results) {
    const driversCollection = db.collection('Drivers');
    
    // Raggruppa i risultati per pilota
    const driverStats = results.reduce((acc, result) => {
        if (!acc[result.driver_id]) {
            acc[result.driver_id] = {
                points: 0,
                wins: 0,
                podiums: 0,
                fastest_laps: 0,
                positions: []
            };
        }
        
        const stats = acc[result.driver_id];
        stats.points += result.points || 0;
        if (result.position === 1) stats.wins++;
        if (result.position <= 3) stats.podiums++;
        if (result.fastest_lap) stats.fastest_laps++;
        stats.positions.push(result.position);
        
        return acc;
    }, {});
    
    // Aggiorna le statistiche nel database
    for (const [driverId, stats] of Object.entries(driverStats)) {
        const avgPosition = stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length;
        
        await driversCollection.updateOne(
            { driver_id: driverId },
            { 
                $set: {
                    'stats.points': stats.points,
                    'stats.wins': stats.wins,
                    'stats.podiums': stats.podiums,
                    'stats.fastest_laps': stats.fastest_laps,
                    'stats.avg_position': avgPosition,
                    'last_updated': new Date()
                }
            }
        );
    }
}

// Esegui lo script
updateRaceResultsDatabase(); 