import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    firstName:     { type: String, required: true },
    lastName:      { type: String, required: true },
    email:         { type: String, required: true, unique: true },
    phone:         { type: String, required: true },
    password:      { type: String, required: true },
    role:          { type: String, enum: ["admin", "user"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    createdAt:     { type: Date, default: Date.now },
});

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", UserSchema);