"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_ORIGINS = exports.MONGODB_URI = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configuredMongoUri = (_a = process.env.MONGODB_URI) === null || _a === void 0 ? void 0 : _a.trim();
const mongoUsername = (_b = process.env.DATABASE_USERNAME) === null || _b === void 0 ? void 0 : _b.trim();
const mongoPassword = process.env.DATABASE_PASSWORD;
const mongoClusterHost = (_c = process.env.MONGODB_CLUSTER_HOST) === null || _c === void 0 ? void 0 : _c.trim();
const mongodbUri = configuredMongoUri ||
    (mongoUsername && mongoPassword && mongoClusterHost
        ? `mongodb+srv://${encodeURIComponent(mongoUsername)}:${encodeURIComponent(mongoPassword)}@${mongoClusterHost}/?retryWrites=true&w=majority`
        : undefined);
if (!mongodbUri) {
    throw new Error("Configure MONGODB_URI or provide DATABASE_USERNAME, DATABASE_PASSWORD, and MONGODB_CLUSTER_HOST");
}
const jwtSecret = (_d = process.env.JWT_SECRET) === null || _d === void 0 ? void 0 : _d.trim();
if (!jwtSecret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
}
const jwtRefreshSecret = (_e = process.env.JWT_REFRESH_SECRET) === null || _e === void 0 ? void 0 : _e.trim();
if (!jwtRefreshSecret) {
    throw new Error("Missing required environment variable: JWT_REFRESH_SECRET");
}
exports.JWT_SECRET = jwtSecret;
exports.JWT_REFRESH_SECRET = jwtRefreshSecret;
exports.MONGODB_URI = mongodbUri;
const configuredCorsOrigins = ((_f = process.env.CORS_ORIGINS) !== null && _f !== void 0 ? _f : "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
exports.CORS_ORIGINS = configuredCorsOrigins.length
    ? configuredCorsOrigins
    : [
        "http://localhost:5173",
        "https://fe-todo-seven.vercel.app",
        "https://fe-todo-git-main-lhknguyens-projects.vercel.app",
    ];
