const jwt = require('jsonwebtoken');

const generateToken = (employeeId) => {
  return jwt.sign({ id: employeeId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;