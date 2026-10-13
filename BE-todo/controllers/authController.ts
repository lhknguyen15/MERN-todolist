import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../config/env";
import {
  clearAuthCookies,
  isValidCsrfToken,
  setAuthCookies,
  setCsrfCookie,
} from "../utils/authCookies";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const issueTokens = (userId: string) => ({
  accessToken: jwt.sign({ id: userId, tokenType: "access" }, JWT_SECRET, {
    expiresIn: "15m",
  }),
  refreshToken: jwt.sign({ id: userId, tokenType: "refresh" }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  }),
});

const toPublicUser = (user: { _id: unknown; username: string; email: string }) => ({
  id: String(user._id),
  username: user.username,
  email: user.email,
});

export const signUp = async (req: Request, res: Response): Promise<void> => {
  if (!isRecord(req.body)) {
    res.status(400).json({ error: "Invalid registration data" });
    return;
  }

  const { username, email, password } = req.body;
  if (
    typeof username !== "string" ||
    !username.trim() ||
    username.trim().length > 100 ||
    typeof email !== "string" ||
    !isValidEmail(email.trim()) ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    res.status(400).json({ error: "Invalid registration data" });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
    await newUser.save();

    const tokens = issueTokens(String(newUser._id));
    const csrfToken = setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(201).json({
      message: "Account created successfully",
      user: toPublicUser(newUser),
      csrfToken,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ error: "Email is already registered" });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  if (!isRecord(req.body)) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  const { email, password } = req.body;
  if (
    typeof email !== "string" ||
    !isValidEmail(email.trim()) ||
    typeof password !== "string" ||
    !password
  ) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    const tokens = issueTokens(String(user._id));
    const csrfToken = setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({ user: toPublicUser(user), csrfToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshSession = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (typeof refreshToken !== "string") {
    clearAuthCookies(res);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  if (
    typeof decoded === "string" ||
    decoded.tokenType !== "refresh" ||
    typeof decoded.id !== "string"
  ) {
    clearAuthCookies(res);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Session expired" });
      return;
    }

    const tokens = issueTokens(String(user._id));
    const csrfToken = setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({ user: toPublicUser(user), csrfToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(toPublicUser(user));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCsrfToken = (req: Request, res: Response): void => {
  const csrfToken = isValidCsrfToken(req.cookies?.csrfToken)
    ? req.cookies.csrfToken
    : setCsrfCookie(res);
  res.json({ csrfToken });
};

export const logoutUser = (_req: Request, res: Response): void => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out" });
};
