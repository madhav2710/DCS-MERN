const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `doctor_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file || !file.mimetype) return cb(null, true);
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only jpeg, png, webp images are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

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

// Get doctor by ID (with reviews -> patient names)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email role phone')
      .populate('reviews.patientId', 'name')
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

// Upload/update doctor profile photo
router.post('/photo', authenticateToken, authorizeRoles('doctor'), upload.single('photo'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const relativePath = `/uploads/${path.basename(req.file.path)}`;
    doctor.photoUrl = relativePath;
    await doctor.save();

    res.json({ success: true, data: { photoUrl: relativePath } });
  } catch (error) {
    console.error('Upload doctor photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});
