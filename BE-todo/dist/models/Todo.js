"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    clientId: { type: String },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: "", maxlength: 3000 },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    startDate: { type: String, default: null },
    dueDate: { type: String, default: null },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", default: null },
});
TodoSchema.index({ userId: 1, clientId: 1 }, { unique: true, partialFilterExpression: { clientId: { $type: "string" } } });
exports.default = (0, mongoose_1.model)("Todo", TodoSchema);
