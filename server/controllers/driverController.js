import Driver from '../models/Driver.js';

// Ottieni tutti i piloti
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('team');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ottieni un pilota specifico
export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('team');
    if (!driver) {
      return res.status(404).json({ message: 'Pilota non trovato' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crea un nuovo pilota
export const createDriver = async (req, res) => {
  try {
    const driver = new Driver({
      driverId: req.body.driverId,
      driverNumber: req.body.driverNumber,
      driverCode: req.body.driverCode,
      driverForename: req.body.driverForename,
      driverSurname: req.body.driverSurname,
      driverNationality: req.body.driverNationality,
      team: req.body.team
    });

    const newDriver = await driver.save();
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Aggiorna un pilota
export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        driverId: req.body.driverId,
        driverNumber: req.body.driverNumber,
        driverCode: req.body.driverCode,
        driverForename: req.body.driverForename,
        driverSurname: req.body.driverSurname,
        driverNationality: req.body.driverNationality,
        team: req.body.team
      },
      { new: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Pilota non trovato' });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Elimina un pilota
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Pilota non trovato' });
    }
    res.json({ message: 'Pilota eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 