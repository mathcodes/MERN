const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get token from header, sending token in with header key 'x-auth-token'
  const token = req.header('x-auth-token');

  // Check if not token, and if not
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // verify takes in 2 things, the token and the secret (config.get('jwtSecret'))
    
    jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: 'Token is not valid' });
      } else {
    // now we need to take the request object (req) and assign a value to user: 'req.user = decoded.user'... 
    // decoded value (has user in the payload) because we attached user with the id in the payload, so now we are setting that req.user
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};
