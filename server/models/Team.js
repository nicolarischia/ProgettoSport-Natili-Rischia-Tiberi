import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  base: {
    type: String,
    required: true
  },
  teamPrincipal: {
    type: String,
    required: true
  },
  foundedYear: {
    type: Number,
    required: true
  },
  logo: {
    type: String
  },
  drivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }]
}, {
  timestamps: true
});

const Team = mongoose.model('Team', teamSchema);
export default Team; 