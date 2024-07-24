// models/Farmer.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true},
  phone: {type: String, required: true},
});

farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

farmerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add a static method to remove a farmer by email
farmerSchema.statics.removeFarmer = async function (id) {
  try {
    const result = await this.findOneAndDelete({ _id:id});
    if (!result) {
      return 'Farmer not found';
    } else {
      return 'Farmer removed successfully';
    }
  } catch (error) {
    console.error('Error removing farmer:', error);
  }
};

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
