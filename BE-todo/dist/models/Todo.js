"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    clientId: { type: String },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
});
TodoSchema.index({ userId: 1, clientId: 1 }, { unique: true, partialFilterExpression: { clientId: { $type: "string" } } });
exports.default = (0, mongoose_1.model)("Todo", TodoSchema);
