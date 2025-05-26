const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const auth = require('../middleware/auth');

// Tutte le routes richiedono autenticazione
router.use(auth);

// Crea una nuova predizione
router.post('/', predictionController.createPrediction);

// Ottieni tutte le predizioni dell'utente
router.get('/my-predictions', predictionController.getUserPredictions);

// Ottieni una predizione specifica
router.get('/:id', predictionController.getPrediction);

// Aggiorna una predizione
router.put('/:id', predictionController.updatePrediction);

// Elimina una predizione
router.delete('/:id', predictionController.deletePrediction);

module.exports = router; 