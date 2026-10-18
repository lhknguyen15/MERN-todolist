import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: Schema.Types.ObjectId;
  clientId?: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

const TodoSchema = new Schema<ITodo>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  clientId: { type: String },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
});

TodoSchema.index(
  { userId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: "string" } } }
);

export default model<ITodo>("Todo", TodoSchema);
