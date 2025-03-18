import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return; // kết thúc hàm, không return response
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      console.log(err); 
      return res.status(403).json({ message: "Forbidden" });
    }
    (req as any).user = decoded;
    next();
  });
};
