const Prediction = require('../models/Prediction');

// Crea una nuova predizione
exports.createPrediction = async (req, res) => {
    try {
        const { race, driver, position, notes } = req.body;
        const userId = req.user.id; // Preso dal middleware di autenticazione

        const prediction = new Prediction({
            userId,
            race,
            driver,
            position,
            notes
        });

        await prediction.save();
        res.status(201).json(prediction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ottieni tutte le predizioni dell'utente
exports.getUserPredictions = async (req, res) => {
    try {
        const userId = req.user.id;
        const predictions = await Prediction.find({ userId })
            .sort({ createdAt: -1 });
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ottieni una predizione specifica
exports.getPrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ message: 'Predizione non trovata' });
        }
        
        // Verifica che l'utente sia il proprietario della predizione
        if (prediction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        res.json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Aggiorna una predizione
exports.updatePrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ message: 'Predizione non trovata' });
        }

        // Verifica che l'utente sia il proprietario della predizione
        if (prediction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        const updatedPrediction = await Prediction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedPrediction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Elimina una predizione
exports.deletePrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ message: 'Predizione non trovata' });
        }

        // Verifica che l'utente sia il proprietario della predizione
        if (prediction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        await prediction.remove();
        res.json({ message: 'Predizione eliminata' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 