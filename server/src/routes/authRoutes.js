import { Router } from "express";

import {
  login,
  register,
  userLogin,
  logout,
  me,
  changePassword,

  // Existing admin management
  getAdmins,
  addAdmin,
  deleteAdmin,

  // New user management
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const r = Router();

// ============================================================
// AUTHENTICATION
// ============================================================

r.post("/login", login);

r.post("/register", register);

r.post("/user-login", userLogin);

r.post("/logout", logout);

r.get("/me", protect, me);

// ============================================================
// CURRENT ADMIN PASSWORD
// ============================================================

r.patch("/change-password", protect, adminOnly, changePassword);

// ============================================================
// EXISTING ADMIN MANAGEMENT
// ============================================================

r.get("/admins", protect, adminOnly, getAdmins);

r.post("/admins", protect, adminOnly, addAdmin);

r.delete("/admins/:id", protect, adminOnly, deleteAdmin);

// ============================================================
// USER MANAGEMENT
// ============================================================

// Get all users
r.get("/users", protect, adminOnly, getUsers);

// Add user
r.post("/users", protect, adminOnly, addUser);

// Get one user
r.get("/users/:id", protect, adminOnly, getUser);

// Edit user
r.patch("/users/:id", protect, adminOnly, updateUser);

// Delete user
r.delete("/users/:id", protect, adminOnly, deleteUser);

export default r;
