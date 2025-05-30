import axios from 'axios';
import { connessioneDb } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fetchDriverData() {
    try {
        const response = await axios.get('https://api.openf1.org/v1/drivers');
        return response.data;
    } catch (error) {
        console.error('Errore nel recupero dei dati dei piloti:', error);
        throw error;
    }
}

async function processDriverData(drivers) {
    // Rimuove i duplicati basandosi sul driver_number
    const uniqueDrivers = Array.from(new Map(drivers.map(driver => [driver.driver_number, driver])).values());
    
    return uniqueDrivers.map(driver => ({
        driver_id: driver.driver_id,
        driver_number: driver.driver_number,
        name: driver.full_name,
        team_name: driver.team_name,
        team_color: driver.team_color,
        stats: {
            points: 0,
            wins: 0,
            podiums: 0,
            fastest_laps: 0,
            avg_position: 0
        },
        last_updated: new Date()
    }));
}

async function updateDriversDatabase() {
    let db;
    try {
        db = await connessioneDb();
        const driversCollection = db.collection('Drivers');
        
        // Recupera i dati dei piloti da OpenF1
        const rawDrivers = await fetchDriverData();
        const processedDrivers = await processDriverData(rawDrivers);
        
        // Aggiorna o inserisce i dati nel database
        for (const driver of processedDrivers) {
            await driversCollection.updateOne(
                { driver_id: driver.driver_id },
                { $set: driver },
                { upsert: true }
            );
        }
        
        console.log('Database aggiornato con successo!');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del database:', error);
    }
}

// Esegui lo script
updateDriversDatabase(); 