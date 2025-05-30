import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nicolarischia1:Nw92FGW4IVmiTFBk@cluster0.akbpc60.mongodb.net/F1-Analytics?retryWrites=true&w=majority";

export async function connessioneDb() {
    try {
        if (!MONGO_URI) {
            throw new Error('MongoDB URI non configurato');
        }
        
        await mongoose.connect(MONGO_URI);
        console.log('Connesso con successo al database MongoDB');
        return mongoose.connection.db;
    } catch (error) {
        console.error('Errore di connessione al database:', error);
        throw error;
    }
}

// Funzioni di utilità per le operazioni CRUD
export async function getAll(collection, query = {}) {
    try {
        const data = await collection.find(query);
        return data;
    } catch (error) {
        console.error(`Errore nel recupero dei dati:`, error);
        throw error;
    }
}

export async function getOne(collection, query) {
    try {
        const data = await collection.findOne(query);
        return data;
    } catch (error) {
        console.error(`Errore nel recupero del documento:`, error);
        throw error;
    }
}

export async function insertOne(collection, data) {
    try {
        const result = await collection.create(data);
        return result;
    } catch (error) {
        console.error(`Errore nell'inserimento del documento:`, error);
        throw error;
    }
}

export async function updateOne(collection, query, update) {
    try {
        const result = await collection.findOneAndUpdate(query, update, { new: true });
        return result;
    } catch (error) {
        console.error(`Errore nell'aggiornamento del documento:`, error);
        throw error;
    }
} 