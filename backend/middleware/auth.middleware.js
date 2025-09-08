const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. If valid, attach the user's info from the token's payload to the request object
    req.user = decoded.user;
    
    // 5. Pass control to the next function in the chain (the actual route)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;