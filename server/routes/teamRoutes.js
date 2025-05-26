import express from 'express';
import { getAllTeams, getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rotte pubbliche
router.get('/', getAllTeams);
router.get('/:id', getTeam);

// Rotte protette (richiedono autenticazione)
router.post('/', authenticateToken, createTeam);
router.put('/:id', authenticateToken, updateTeam);
router.delete('/:id', authenticateToken, deleteTeam);

export default router; 