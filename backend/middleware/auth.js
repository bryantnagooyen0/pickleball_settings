import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }
  return next();
};


