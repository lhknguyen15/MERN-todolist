import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: Schema.Types.ObjectId;
  clientId?: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  startDate: string | null;
  dueDate: string | null;
  categoryId: Schema.Types.ObjectId | null;
}

const TodoSchema = new Schema<ITodo>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  clientId: { type: String },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: "", maxlength: 3000 },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  startDate: { type: String, default: null },
  dueDate: { type: String, default: null },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
});

TodoSchema.index(
  { userId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: "string" } } }
);

export default model<ITodo>("Todo", TodoSchema);
