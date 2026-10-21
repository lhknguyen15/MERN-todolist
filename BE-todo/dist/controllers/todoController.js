"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.getTodos = exports.importGuestTodos = exports.createTodo = void 0;
const Todo_1 = __importDefault(require("../models/Todo"));
const Category_1 = __importDefault(require("../models/Category"));
const mongoose_1 = require("mongoose");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isDateOnly = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (!Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value);
};
const isOptionalDate = (value) => value === undefined || value === null || isDateOnly(value);
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const body = req.body;
    if (!body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 300 ||
        (body.description !== undefined &&
            (typeof body.description !== "string" || body.description.length > 3000))) {
        res
            .status(400)
            .json({
            error: "Title must be 1–300 characters and description must be at most 3000 characters",
        });
        return;
    }
    const priority = (_a = body.priority) !== null && _a !== void 0 ? _a : "medium";
    if (priority !== "low" && priority !== "medium" && priority !== "high") {
        res.status(400).json({ error: "Priority must be low, medium, or high" });
        return;
    }
    const startDate = (_b = body.startDate) !== null && _b !== void 0 ? _b : null;
    const dueDate = (_c = body.dueDate) !== null && _c !== void 0 ? _c : null;
    if (!isOptionalDate(body.startDate) || !isOptionalDate(body.dueDate)) {
        res.status(400).json({ error: "Dates must use YYYY-MM-DD format" });
        return;
    }
    if (startDate && dueDate && startDate > dueDate) {
        res.status(400).json({ error: "Start date cannot be after due date" });
        return;
    }
    const title = body.title.trim();
    const userId = req.user.id;
    const categoryId = (_d = body.categoryId) !== null && _d !== void 0 ? _d : null;
    if (categoryId !== null &&
        (typeof categoryId !== "string" || !mongoose_1.Types.ObjectId.isValid(categoryId))) {
        res.status(400).json({ error: "Invalid category id" });
        return;
    }
    try {
        if (categoryId && !(yield Category_1.default.exists({ _id: categoryId, userId }))) {
            res
                .status(400)
                .json({ error: "Category does not belong to this account" });
            return;
        }
        const description = typeof body.description === "string" ? body.description.trim() : "";
        const todo = new Todo_1.default({
            userId,
            title,
            description,
            priority,
            startDate,
            dueDate,
            categoryId,
        });
        yield todo.save();
        res.status(201).json(todo);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.createTodo = createTodo;
const importGuestTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const body = req.body;
    if (!isRecord(body) ||
        !Array.isArray(body.todos) ||
        body.todos.length > 500) {
        res.status(400).json({ error: "Invalid todo import data" });
        return;
    }
    const todosByClientId = new Map();
    for (const item of body.todos) {
        if (!isRecord(item)) {
            res.status(400).json({ error: "Invalid todo import data" });
            return;
        }
        const { clientId, title, completed } = item;
        const priority = (_a = item.priority) !== null && _a !== void 0 ? _a : "medium";
        const startDate = isDateOnly(item.startDate) ? item.startDate : null;
        const dueDate = isDateOnly(item.dueDate) ? item.dueDate : null;
        const categoryId = (_b = item.categoryId) !== null && _b !== void 0 ? _b : null;
        if (typeof clientId !== "string" ||
            !clientId.trim() ||
            clientId.length > 100 ||
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 300 ||
            (item.description !== undefined &&
                (typeof item.description !== "string" ||
                    item.description.length > 3000)) ||
            (completed !== undefined && typeof completed !== "boolean") ||
            (priority !== "low" && priority !== "medium" && priority !== "high") ||
            !isOptionalDate(item.startDate) ||
            !isOptionalDate(item.dueDate) ||
            (categoryId !== null &&
                (typeof categoryId !== "string" ||
                    !mongoose_1.Types.ObjectId.isValid(categoryId))) ||
            (startDate && dueDate && startDate > dueDate)) {
            res.status(400).json({ error: "Invalid todo import data" });
            return;
        }
        todosByClientId.set(clientId, {
            clientId,
            title: title.trim(),
            description: typeof item.description === "string" ? item.description.trim() : "",
            completed: completed === true,
            priority,
            startDate,
            dueDate,
            categoryId,
        });
    }
    if (todosByClientId.size === 0) {
        res.json({ imported: 0 });
        return;
    }
    const userId = req.user.id;
    try {
        const requestedCategoryIds = [
            ...new Set([...todosByClientId.values()]
                .map((todo) => todo.categoryId)
                .filter((id) => id !== null)),
        ];
        if (requestedCategoryIds.length > 0) {
            const ownedCategories = yield Category_1.default.find({
                userId,
                _id: { $in: requestedCategoryIds },
            }).select("_id");
            if (ownedCategories.length !== requestedCategoryIds.length) {
                res
                    .status(400)
                    .json({
                    error: "One or more categories do not belong to this account",
                });
                return;
            }
        }
        yield Todo_1.default.bulkWrite([...todosByClientId.values()].map((todo) => ({
            updateOne: {
                filter: { userId, clientId: todo.clientId },
                update: {
                    $set: {
                        title: todo.title,
                        description: todo.description,
                        completed: todo.completed,
                        priority: todo.priority,
                        startDate: todo.startDate,
                        dueDate: todo.dueDate,
                        categoryId: todo.categoryId,
                    },
                    $setOnInsert: { userId, clientId: todo.clientId },
                },
                upsert: true,
            },
        })));
        const importedTodos = yield Todo_1.default.find({
            userId,
            clientId: { $in: [...todosByClientId.keys()] },
        });
        res.json({ imported: importedTodos.length, todos: importedTodos });
    }
    catch (_c) {
        res.status(500).json({ error: "Could not import todos" });
    }
});
exports.importGuestTodos = importGuestTodos;
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const todos = yield Todo_1.default.find({ userId });
        res.json(todos);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getTodos = getTodos;
// Cập nhật Todo
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const body = req.body;
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({ error: "Invalid update data" });
        }
        const allowedFields = [
            "title",
            "description",
            "completed",
            "priority",
            "startDate",
            "dueDate",
            "categoryId",
        ];
        if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
            return res.status(400).json({ error: "Unsupported update field" });
        }
        const updates = {};
        if ("title" in body) {
            if (typeof body.title !== "string" ||
                !body.title.trim() ||
                body.title.trim().length > 300) {
                return res
                    .status(400)
                    .json({ error: "Title must contain 1 to 300 characters" });
            }
            updates.title = body.title.trim();
        }
        if ("description" in body) {
            if (typeof body.description !== "string" ||
                body.description.length > 3000) {
                return res
                    .status(400)
                    .json({ error: "Description must be at most 3000 characters" });
            }
            updates.description = body.description.trim();
        }
        if ("completed" in body) {
            if (typeof body.completed !== "boolean") {
                return res.status(400).json({ error: "Completed must be a boolean" });
            }
            updates.completed = body.completed;
        }
        if ("priority" in body) {
            if (body.priority !== "low" &&
                body.priority !== "medium" &&
                body.priority !== "high") {
                return res
                    .status(400)
                    .json({ error: "Priority must be low, medium, or high" });
            }
            updates.priority = body.priority;
        }
        if ("startDate" in body) {
            if (!isOptionalDate(body.startDate)) {
                return res
                    .status(400)
                    .json({ error: "Start date must use YYYY-MM-DD format or be null" });
            }
            updates.startDate = (_a = body.startDate) !== null && _a !== void 0 ? _a : null;
        }
        if ("dueDate" in body) {
            if (!isOptionalDate(body.dueDate)) {
                return res
                    .status(400)
                    .json({ error: "Due date must use YYYY-MM-DD format or be null" });
            }
            updates.dueDate = (_b = body.dueDate) !== null && _b !== void 0 ? _b : null;
        }
        if ("categoryId" in body) {
            if (body.categoryId !== null &&
                (typeof body.categoryId !== "string" ||
                    !mongoose_1.Types.ObjectId.isValid(body.categoryId))) {
                return res.status(400).json({ error: "Invalid category id" });
            }
            if (body.categoryId &&
                !(yield Category_1.default.exists({ _id: body.categoryId, userId }))) {
                return res
                    .status(400)
                    .json({ error: "Category does not belong to this account" });
            }
            updates.categoryId = body.categoryId
                ? new mongoose_1.Types.ObjectId(body.categoryId)
                : null;
        }
        if ("startDate" in updates || "dueDate" in updates) {
            const currentTodo = yield Todo_1.default.findOne({ _id: id, userId });
            if (!currentTodo)
                return res.status(404).json({ error: "Todo does not exist" });
            const nextStartDate = "startDate" in updates ? updates.startDate : currentTodo.startDate;
            const nextDueDate = "dueDate" in updates ? updates.dueDate : currentTodo.dueDate;
            if (nextStartDate && nextDueDate && nextStartDate > nextDueDate) {
                return res
                    .status(400)
                    .json({ error: "Start date cannot be after due date" });
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No update fields provided" });
        }
        // Tìm Todo theo id và userId để đảm bảo chỉ user sở hữu mới được chỉnh sửa
        const updatedTodo = yield Todo_1.default.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ error: "Todo không tồn tại" });
        }
        res.json(updatedTodo);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.updateTodo = updateTodo;
// Xóa Todo
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        // Xóa Todo chỉ khi nó thuộc về user hiện tại
        const deletedTodo = yield Todo_1.default.findOneAndDelete({ _id: id, userId });
        if (!deletedTodo) {
            return res.status(404).json({ error: "Todo không tồn tại" });
        }
        res.json({ message: "Xóa Todo thành công" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.deleteTodo = deleteTodo;
