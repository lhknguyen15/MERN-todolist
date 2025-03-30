import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const signUp = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const accessToken = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(201).json({
      message: "Tạo tài khoản thành công",
      accessToken,
    });
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
      expiresIn: "30m",
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.status(200).json({ message: "Đã đăng xuất" });
};
