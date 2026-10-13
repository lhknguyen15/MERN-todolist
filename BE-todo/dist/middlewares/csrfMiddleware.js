"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCsrfToken = void 0;
const crypto_1 = require("crypto");
const authCookies_1 = require("../utils/authCookies");
const verifyCsrfToken = (req, res, next) => {
    var _a;
    const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.csrfToken;
    const headerToken = req.get("x-csrf-token");
    if (!(0, authCookies_1.isValidCsrfToken)(cookieToken) ||
        typeof headerToken !== "string" ||
        cookieToken.length !== headerToken.length ||
        !(0, crypto_1.timingSafeEqual)(Buffer.from(cookieToken), Buffer.from(headerToken))) {
        res.status(403).json({ error: "Invalid CSRF token" });
        return;
    }
    next();
};
exports.verifyCsrfToken = verifyCsrfToken;
