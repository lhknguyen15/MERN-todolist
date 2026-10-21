import { Request, Response } from "express";
import { Types } from "mongoose";
import Category, { CATEGORY_COLORS, CategoryColor } from "../models/Category";
import Todo from "../models/Todo";

const normalizeName = (name: string) => name.trim().toLocaleLowerCase("vi");
const isColor = (value: unknown): value is CategoryColor =>
  typeof value === "string" && CATEGORY_COLORS.includes(value as CategoryColor);

const duplicateName = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ userId: (req as any).user.id }).sort({ name: 1 });
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Could not load categories" });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, color = "emerald" } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 40) {
    res.status(400).json({ error: "Name must contain 1 to 40 characters" });
    return;
  }
  if (!isColor(color)) {
    res.status(400).json({ error: "Invalid category color" });
    return;
  }

  try {
    const category = await Category.create({
      userId: (req as any).user.id,
      name: name.trim(),
      normalizedName: normalizeName(name),
      color,
    });
    res.status(201).json(category);
  } catch (error) {
    if (duplicateName(error)) {
      res.status(409).json({ error: "A category with this name already exists" });
      return;
    }
    res.status(500).json({ error: "Could not create category" });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, color } = req.body ?? {};
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }
  if (typeof name !== "string" || !name.trim() || name.trim().length > 40 || !isColor(color)) {
    res.status(400).json({ error: "Provide a valid name and color" });
    return;
  }

  try {
    const category = await Category.findOneAndUpdate(
      { _id: id, userId: (req as any).user.id },
      { $set: { name: name.trim(), normalizedName: normalizeName(name), color } },
      { new: true, runValidators: true }
    );
    if (!category) {
      res.status(404).json({ error: "Category does not exist" });
      return;
    }
    res.json(category);
  } catch (error) {
    if (duplicateName(error)) {
      res.status(409).json({ error: "A category with this name already exists" });
      return;
    }
    res.status(500).json({ error: "Could not update category" });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }

  try {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      res.status(404).json({ error: "Category does not exist" });
      return;
    }
    await Todo.updateMany({ userId, categoryId: category._id }, { $set: { categoryId: null } });
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch {
    res.status(500).json({ error: "Could not delete category" });
  }
};
