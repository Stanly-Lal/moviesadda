import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

await connectDB();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password)
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

let user = await User.findOne({ email });

if (!user) {
  user = await User.create({ email, password });
  console.log("Admin created");
} else console.log("Admin already exists");
process.exit(0);
