"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_ORIGINS = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = (_a = process.env.JWT_SECRET) === null || _a === void 0 ? void 0 : _a.trim();
if (!jwtSecret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
}
const jwtRefreshSecret = (_b = process.env.JWT_REFRESH_SECRET) === null || _b === void 0 ? void 0 : _b.trim();
if (!jwtRefreshSecret) {
    throw new Error("Missing required environment variable: JWT_REFRESH_SECRET");
}
exports.JWT_SECRET = jwtSecret;
exports.JWT_REFRESH_SECRET = jwtRefreshSecret;
const configuredCorsOrigins = ((_c = process.env.CORS_ORIGINS) !== null && _c !== void 0 ? _c : "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
exports.CORS_ORIGINS = configuredCorsOrigins.length
    ? configuredCorsOrigins
    : ["http://localhost:5173", "https://fe-todo-seven.vercel.app"];
