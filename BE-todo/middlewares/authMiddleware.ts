import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface DecodedToken {
  id: string;
  tokenType: "access";
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "string" ||
      decoded.tokenType !== "access" ||
      typeof decoded.id !== "string"
    ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    (req as any).user = decoded as DecodedToken;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
