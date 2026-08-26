const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/register
exports.registerEmployee = async (req, res) => {
  try {
    const { employeeId, employeeName, password } = req.body;

    if (!employeeId || !employeeName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
      employeeId,
      employeeName,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route POST /api/auth/login
exports.loginEmployee = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ message: 'Employee ID and password required' });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid employee ID or password' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid employee ID or password' });
    }

    res.status(200).json({
      _id: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};