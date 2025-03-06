import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  completed: boolean;
}

const TodoSchema = new Schema<ITodo>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

export default model<ITodo>("Todo", TodoSchema);
