"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.setCsrfCookie = exports.isValidCsrfToken = exports.createCsrfToken = void 0;
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
const isProduction = process.env.NODE_ENV === "production";
const sameSite = isProduction ? "none" : "lax";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const createCsrfToken = () => {
    const nonce = (0, crypto_1.randomBytes)(32).toString("hex");
    const signature = (0, crypto_1.createHmac)("sha256", env_1.JWT_SECRET).update(nonce).digest("hex");
    return `${nonce}.${signature}`;
};
exports.createCsrfToken = createCsrfToken;
const isValidCsrfToken = (token) => {
    if (typeof token !== "string")
        return false;
    const [nonce, signature] = token.split(".");
    if (!nonce || !signature)
        return false;
    const expected = (0, crypto_1.createHmac)("sha256", env_1.JWT_SECRET).update(nonce).digest("hex");
    const actualBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return (actualBuffer.length === expectedBuffer.length &&
        (0, crypto_1.timingSafeEqual)(actualBuffer, expectedBuffer));
};
exports.isValidCsrfToken = isValidCsrfToken;
const setCsrfCookie = (res) => {
    const csrfToken = (0, exports.createCsrfToken)();
    res.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite,
        path: "/",
        maxAge: sessionDurationMs,
    });
    return csrfToken;
};
exports.setCsrfCookie = setCsrfCookie;
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        path: "/api",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite,
        path: "/api/auth",
        maxAge: sessionDurationMs,
    });
    return (0, exports.setCsrfCookie)(res);
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", { path: "/api" });
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.clearCookie("csrfToken", { path: "/" });
};
exports.clearAuthCookies = clearAuthCookies;
