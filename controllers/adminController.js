const Farmer = require('../models/farmer');

exports.listFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({}, { name: 1, email: 1, _id: 1 });
    return res.status(200).json({ success: true, farmers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addFarmer = async (req, res) => {
  const { name, email, location } = req.body;
  try {
    const newFarmer = new Farmer({ name, email, location });
    await newFarmer.save();
    return res.status(201).json({ success: true, id: newFarmer._id, message: 'Farmer added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
