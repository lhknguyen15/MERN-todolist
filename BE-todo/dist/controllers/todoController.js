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
exports.deleteTodo = exports.updateTodo = exports.getTodos = exports.createTodo = void 0;
const Todo_1 = __importDefault(require("../models/Todo"));
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    const userId = req.user.id;
    try {
        const todo = new Todo_1.default({ userId, title });
        yield todo.save();
        res.status(201).json(todo);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.createTodo = createTodo;
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
    const { id } = req.params;
    const userId = req.user.id;
    try {
        // Tìm Todo theo id và userId để đảm bảo chỉ user sở hữu mới được chỉnh sửa
        const updatedTodo = yield Todo_1.default.findOneAndUpdate({ _id: id, userId }, req.body, { new: true } // trả về document đã được cập nhật
        );
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
