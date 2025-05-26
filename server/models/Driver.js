import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  driverId: {
    type: Number,
    required: true,
    unique: true
  },
  driverNumber: {
    type: Number,
    required: true
  },
  driverCode: {
    type: String,
    required: true
  },
  driverForename: {
    type: String,
    required: true
  },
  driverSurname: {
    type: String,
    required: true
  },
  driverNationality: {
    type: String,
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver; 