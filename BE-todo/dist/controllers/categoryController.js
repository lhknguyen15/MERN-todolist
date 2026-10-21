"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const mongoose_1 = require("mongoose");
const Category_1 = __importStar(require("../models/Category"));
const Todo_1 = __importDefault(require("../models/Todo"));
const normalizeName = (name) => name.trim().toLocaleLowerCase("vi");
const isColor = (value) => typeof value === "string" && Category_1.CATEGORY_COLORS.includes(value);
const duplicateName = (error) => typeof error === "object" && error !== null && "code" in error && error.code === 11000;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find({ userId: req.user.id }).sort({ name: 1 });
        res.json(categories);
    }
    catch (_a) {
        res.status(500).json({ error: "Could not load categories" });
    }
});
exports.getCategories = getCategories;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, color = "emerald" } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (typeof name !== "string" || !name.trim() || name.trim().length > 40) {
        res.status(400).json({ error: "Name must contain 1 to 40 characters" });
        return;
    }
    if (!isColor(color)) {
        res.status(400).json({ error: "Invalid category color" });
        return;
    }
    try {
        const category = yield Category_1.default.create({
            userId: req.user.id,
            name: name.trim(),
            normalizedName: normalizeName(name),
            color,
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (duplicateName(error)) {
            res.status(409).json({ error: "A category with this name already exists" });
            return;
        }
        res.status(500).json({ error: "Could not create category" });
    }
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, color } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid category id" });
        return;
    }
    if (typeof name !== "string" || !name.trim() || name.trim().length > 40 || !isColor(color)) {
        res.status(400).json({ error: "Provide a valid name and color" });
        return;
    }
    try {
        const category = yield Category_1.default.findOneAndUpdate({ _id: id, userId: req.user.id }, { $set: { name: name.trim(), normalizedName: normalizeName(name), color } }, { new: true, runValidators: true });
        if (!category) {
            res.status(404).json({ error: "Category does not exist" });
            return;
        }
        res.json(category);
    }
    catch (error) {
        if (duplicateName(error)) {
            res.status(409).json({ error: "A category with this name already exists" });
            return;
        }
        res.status(500).json({ error: "Could not update category" });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid category id" });
        return;
    }
    try {
        const category = yield Category_1.default.findOne({ _id: id, userId });
        if (!category) {
            res.status(404).json({ error: "Category does not exist" });
            return;
        }
        yield Todo_1.default.updateMany({ userId, categoryId: category._id }, { $set: { categoryId: null } });
        yield category.deleteOne();
        res.json({ message: "Category deleted" });
    }
    catch (_a) {
        res.status(500).json({ error: "Could not delete category" });
    }
});
exports.deleteCategory = deleteCategory;
