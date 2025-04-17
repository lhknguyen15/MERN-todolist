"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.default({ username, email, password: hashedPassword });
        yield newUser.save();
        const accessToken = jsonwebtoken_1.default.sign({ id: newUser._id }, JWT_SECRET, {
            expiresIn: "15m",
        });
        res.status(201).json({
            message: "Tạo tài khoản thành công",
            accessToken,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return res
                .status(400)
                .json({ error: "Thông tin đăng nhập không hợp lệ" });
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res
                .status(400)
                .json({ error: "Thông tin đăng nhập không hợp lệ" });
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "30m",
        });
        res.json({ accessToken });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.signIn = signIn;
const logoutUser = (req, res) => {
    res.status(200).json({ message: "Đã đăng xuất" });
};
exports.logoutUser = logoutUser;
