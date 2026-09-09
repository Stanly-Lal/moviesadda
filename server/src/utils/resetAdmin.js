import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

await connectDB();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const user = await User.findOne({ email });

if (!user) {
  console.log("Admin user not found");
  process.exit(1);
}

user.password = password;

await user.save();

console.log("Admin password updated successfully.");

await mongoose.disconnect();
process.exit(0);
