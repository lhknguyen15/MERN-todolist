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
exports.logoutUser = exports.getCsrfToken = exports.getCurrentUser = exports.refreshSession = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const env_1 = require("../config/env");
const authCookies_1 = require("../utils/authCookies");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isDuplicateKeyError = (error) => typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const issueTokens = (userId) => ({
    accessToken: jsonwebtoken_1.default.sign({ id: userId, tokenType: "access" }, env_1.JWT_SECRET, {
        expiresIn: "15m",
    }),
    refreshToken: jsonwebtoken_1.default.sign({ id: userId, tokenType: "refresh" }, env_1.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    }),
});
const toPublicUser = (user) => ({
    id: String(user._id),
    username: user.username,
    email: user.email,
});
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isRecord(req.body)) {
        res.status(400).json({ error: "Invalid registration data" });
        return;
    }
    const { username, email, password } = req.body;
    if (typeof username !== "string" ||
        !username.trim() ||
        username.trim().length > 100 ||
        typeof email !== "string" ||
        !isValidEmail(email.trim()) ||
        typeof password !== "string" ||
        password.length < 6) {
        res.status(400).json({ error: "Invalid registration data" });
        return;
    }
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.default({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });
        yield newUser.save();
        const tokens = issueTokens(String(newUser._id));
        const csrfToken = (0, authCookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        res.status(201).json({
            message: "Account created successfully",
            user: toPublicUser(newUser),
            csrfToken,
        });
    }
    catch (error) {
        if (isDuplicateKeyError(error)) {
            res.status(409).json({ error: "Email is already registered" });
            return;
        }
        res.status(500).json({ error: "Server error" });
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isRecord(req.body)) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
    }
    const { email, password } = req.body;
    if (typeof email !== "string" ||
        !isValidEmail(email.trim()) ||
        typeof password !== "string" ||
        !password) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
    }
    try {
        const user = yield User_1.default.findOne({ email: email.trim().toLowerCase() });
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }
        const tokens = issueTokens(String(user._id));
        const csrfToken = (0, authCookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        res.json({ user: toPublicUser(user), csrfToken });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.signIn = signIn;
const refreshSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (typeof refreshToken !== "string") {
        (0, authCookies_1.clearAuthCookies)(res);
        res.status(401).json({ error: "Session expired" });
        return;
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.JWT_REFRESH_SECRET);
    }
    catch (error) {
        (0, authCookies_1.clearAuthCookies)(res);
        res.status(401).json({ error: "Session expired" });
        return;
    }
    if (typeof decoded === "string" ||
        decoded.tokenType !== "refresh" ||
        typeof decoded.id !== "string") {
        (0, authCookies_1.clearAuthCookies)(res);
        res.status(401).json({ error: "Session expired" });
        return;
    }
    try {
        const user = yield User_1.default.findById(decoded.id);
        if (!user) {
            (0, authCookies_1.clearAuthCookies)(res);
            res.status(401).json({ error: "Session expired" });
            return;
        }
        const tokens = issueTokens(String(user._id));
        const csrfToken = (0, authCookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        res.json({ user: toPublicUser(user), csrfToken });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.refreshSession = refreshSession;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(toPublicUser(user));
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getCurrentUser = getCurrentUser;
const getCsrfToken = (req, res) => {
    var _a;
    const csrfToken = (0, authCookies_1.isValidCsrfToken)((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.csrfToken)
        ? req.cookies.csrfToken
        : (0, authCookies_1.setCsrfCookie)(res);
    res.json({ csrfToken });
};
exports.getCsrfToken = getCsrfToken;
const logoutUser = (_req, res) => {
    (0, authCookies_1.clearAuthCookies)(res);
    res.status(200).json({ message: "Logged out" });
};
exports.logoutUser = logoutUser;
