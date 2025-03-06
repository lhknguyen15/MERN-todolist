import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
});

export default model<IUser>("User", UserSchema);
