import dotenv from "dotenv";

dotenv.config();

const configuredMongoUri = process.env.MONGODB_URI?.trim();
const mongoUsername = process.env.DATABASE_USERNAME?.trim();
const mongoPassword = process.env.DATABASE_PASSWORD;
const mongoClusterHost = process.env.MONGODB_CLUSTER_HOST?.trim();
const mongodbUri = configuredMongoUri ||
  (mongoUsername && mongoPassword && mongoClusterHost
    ? `mongodb+srv://${encodeURIComponent(mongoUsername)}:${encodeURIComponent(mongoPassword)}@${mongoClusterHost}/?retryWrites=true&w=majority`
    : undefined);

if (!mongodbUri) {
  throw new Error(
    "Configure MONGODB_URI or provide DATABASE_USERNAME, DATABASE_PASSWORD, and MONGODB_CLUSTER_HOST"
  );
}

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
export const MONGODB_URI = mongodbUri;

const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const CORS_ORIGINS = configuredCorsOrigins.length
  ? configuredCorsOrigins
  : [
      "http://localhost:5173",
      "https://fe-todo-seven.vercel.app",
      "https://fe-todo-git-main-lhknguyens-projects.vercel.app",
    ];
