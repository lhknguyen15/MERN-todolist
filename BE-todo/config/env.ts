import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET?.trim();
if (!jwtRefreshSecret) {
  throw new Error("Missing required environment variable: JWT_REFRESH_SECRET");
}

export const JWT_SECRET = jwtSecret;
export const JWT_REFRESH_SECRET = jwtRefreshSecret;

const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const CORS_ORIGINS = configuredCorsOrigins.length
  ? configuredCorsOrigins
  : ["http://localhost:5173", "https://fe-todo-seven.vercel.app"];
