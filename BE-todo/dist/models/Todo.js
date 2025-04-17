"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
});
exports.default = (0, mongoose_1.model)("Todo", TodoSchema);
