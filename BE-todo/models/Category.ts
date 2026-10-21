import { Document, Schema, model } from "mongoose";

export const CATEGORY_COLORS = ["emerald", "blue", "violet", "amber", "rose", "slate"] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export interface ICategory extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  normalizedName: string;
  color: CategoryColor;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    normalizedName: { type: String, required: true },
    color: { type: String, enum: CATEGORY_COLORS, default: "emerald" },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export default model<ICategory>("Category", CategorySchema);
