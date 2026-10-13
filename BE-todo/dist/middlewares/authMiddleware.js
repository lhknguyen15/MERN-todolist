"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        if (typeof decoded === "string" ||
            decoded.tokenType !== "access" ||
            typeof decoded.id !== "string") {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
};
exports.authenticateToken = authenticateToken;
