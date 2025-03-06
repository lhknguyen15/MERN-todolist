import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

dotenv.config();

const JWT_SECRET = `process.env.JWT_SECRET`;
const JWT_REFRESH_SECRET = `process.env.JWT_REFRESH_SECRET`;

export const signUp = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const signIn = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ error: "Không có token nào được cung cấp" });
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const accessToken = jwt.sign({ id: payload._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Refresh token không hợp lệ" });
  }
};
