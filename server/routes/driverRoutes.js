import express from 'express';
import { getAllDrivers, getDriver, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rotte pubbliche
router.get('/', getAllDrivers);
router.get('/:id', getDriver);

// Rotte protette (richiedono autenticazione)
router.post('/', authenticateToken, createDriver);
router.put('/:id', authenticateToken, updateDriver);
router.delete('/:id', authenticateToken, deleteDriver);

export default router; 