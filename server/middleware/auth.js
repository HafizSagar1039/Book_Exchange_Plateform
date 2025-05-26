import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

export default auth;
