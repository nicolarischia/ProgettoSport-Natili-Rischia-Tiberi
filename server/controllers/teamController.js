import Team from '../models/Team.js';

// Ottieni tutti i team
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('drivers');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ottieni un team specifico
export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('drivers');
    if (!team) {
      return res.status(404).json({ message: 'Team non trovato' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crea un nuovo team
export const createTeam = async (req, res) => {
  const team = new Team(req.body);
  try {
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Aggiorna un team
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) {
      return res.status(404).json({ message: 'Team non trovato' });
    }
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Elimina un team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team non trovato' });
    }
    res.json({ message: 'Team eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 