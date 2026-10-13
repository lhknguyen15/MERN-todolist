import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { Response } from "express";
import { JWT_SECRET } from "../config/env";

const isProduction = process.env.NODE_ENV === "production";
const sameSite = isProduction ? "none" : "lax";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

export const createCsrfToken = (): string => {
  const nonce = randomBytes(32).toString("hex");
  const signature = createHmac("sha256", JWT_SECRET).update(nonce).digest("hex");
  return `${nonce}.${signature}`;
};

export const isValidCsrfToken = (token: unknown): token is string => {
  if (typeof token !== "string") return false;
  const [nonce, signature] = token.split(".");
  if (!nonce || !signature) return false;

  const expected = createHmac("sha256", JWT_SECRET).update(nonce).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

export const setCsrfCookie = (res: Response): string => {
  const csrfToken = createCsrfToken();
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite,
    path: "/",
    maxAge: sessionDurationMs,
  });
  return csrfToken;
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): string => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/api",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/api/auth",
    maxAge: sessionDurationMs,
  });
  return setCsrfCookie(res);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/api" });
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.clearCookie("csrfToken", { path: "/" });
};