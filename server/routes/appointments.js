const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, time, symptoms } = req.body;
    const patientId = req.user._id;

    // Validation
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, and time'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if appointment already exists for this time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      symptoms
    });

    await newAppointment.save();

    // Populate doctor and patient details, including doctor's linked user
    await newAppointment.populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name email role phone' }
    });
    await newAppointment.populate('patientId', 'name email');

    const appointmentResponse = newAppointment.toObject();
    // Normalize doctor object to expose `user` instead of `userId`
    if (appointmentResponse.doctorId) {
      const doctorObj = appointmentResponse.doctorId.toObject ? appointmentResponse.doctorId.toObject() : appointmentResponse.doctorId;
      const doctorWithUser = { ...doctorObj, user: doctorObj.userId };
      delete doctorWithUser.userId;
      appointmentResponse.doctor = doctorWithUser;
    }
    appointmentResponse.patient = appointmentResponse.patientId;
    delete appointmentResponse.doctorId;
    delete appointmentResponse.patientId;

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointmentResponse
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
});

// Get patient appointments
router.get('/patient', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user._id;
    const appointments = await Appointment.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email role phone' }
      })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    const appointmentsWithDetails = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      // Normalize doctor object to expose `user` instead of `userId`
      if (appointmentObj.doctorId) {
        const doctorObj = appointmentObj.doctorId;
        const doctorWithUser = { ...doctorObj, user: doctorObj.userId };
        delete doctorWithUser.userId;
        appointmentObj.doctor = doctorWithUser;
      }
      appointmentObj.patient = appointmentObj.patientId;
      delete appointmentObj.doctorId;
      delete appointmentObj.patientId;
      return appointmentObj;
    });

    res.json({
      success: true,
      count: appointmentsWithDetails.length,
      data: appointmentsWithDetails
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Get doctor appointments
router.get('/doctor', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone')
      .populate('doctorId')
      .sort({ createdAt: -1 });

    const appointmentsWithDetails = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      appointmentObj.patient = appointmentObj.patientId;
      appointmentObj.doctor = appointmentObj.doctorId;
      delete appointmentObj.patientId;
      delete appointmentObj.doctorId;
      return appointmentObj;
    });

    res.json({
      success: true,
      count: appointmentsWithDetails.length,
      data: appointmentsWithDetails
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Update appointment status
router.put('/:id/status', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor owns this appointment
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to cancel (patient or doctor)
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor';

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to view this appointment
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor';

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    const appointmentWithDetails = {
      ...appointment.toObject(),
      doctor: appointment.doctorId,
      patient: appointment.patientId
    };

    delete appointmentWithDetails.doctorId;
    delete appointmentWithDetails.patientId;

    res.json({
      success: true,
      data: appointmentWithDetails
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

module.exports = router;
