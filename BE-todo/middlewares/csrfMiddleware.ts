import { timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";
import { isValidCsrfToken } from "../utils/authCookies";

export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("x-csrf-token");

  if (
    !isValidCsrfToken(cookieToken) ||
    typeof headerToken !== "string" ||
    cookieToken.length !== headerToken.length ||
    !timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }

  next();
};