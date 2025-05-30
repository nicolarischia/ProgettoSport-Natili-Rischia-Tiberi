import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funzione per eseguire uno script
function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Errore nell'esecuzione di ${scriptPath}:`, error);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Stderr di ${scriptPath}:`, stderr);
            }
            console.log(`Output di ${scriptPath}:`, stdout);
            resolve();
        });
    });
}

// Esegui tutti gli scraper
async function runAllScrapers() {
    try {
        console.log('Inizio aggiornamento dati...');
        
        // Esegui gli scraper in sequenza
        await runScript(path.join(__dirname, 'scrapers/driverScraper.js'));
        await runScript(path.join(__dirname, 'scrapers/raceResultsScraper.js'));
        await runScript(path.join(__dirname, 'scrapers/teamScraper.js'));
        
        console.log('Aggiornamento dati completato con successo!');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dati:', error);
    }
}

// Esegui gli scraper ogni giorno alle 3:00 AM
cron.schedule('0 3 * * *', () => {
    console.log('Esecuzione programmata degli scraper...');
    runAllScrapers();
});

// Esegui gli scraper all'avvio
console.log('Avvio scheduler...');
runAllScrapers(); 