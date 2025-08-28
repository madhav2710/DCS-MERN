const express = require('express');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email role phone')
      .select('-__v');

    const doctorsWithUsers = doctors.map(doctor => {
      const doctorObj = doctor.toObject();
      doctorObj.user = doctorObj.userId;
      delete doctorObj.userId;
      return doctorObj;
    });

    res.json({
      success: true,
      count: doctorsWithUsers.length,
      data: doctorsWithUsers
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email role phone')
      .select('-__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctorWithUser = doctor.toObject();
    doctorWithUser.user = doctorWithUser.userId;
    delete doctorWithUser.userId;

    res.json({
      success: true,
      data: doctorWithUser
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor'
    });
  }
});

module.exports = router;
