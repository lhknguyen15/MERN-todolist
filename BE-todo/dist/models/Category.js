"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_COLORS = void 0;
const mongoose_1 = require("mongoose");
exports.CATEGORY_COLORS = ["emerald", "blue", "violet", "amber", "rose", "slate"];
const CategorySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    normalizedName: { type: String, required: true },
    color: { type: String, enum: exports.CATEGORY_COLORS, default: "emerald" },
}, { timestamps: true });
CategorySchema.index({ userId: 1, normalizedName: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Category", CategorySchema);
