import { Router } from "express";

import {
  list,
  adminList,
  getOne,
  create,
  update,
  remove,
} from "../controllers/videoController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const r = Router();

// ========================================
// PUBLIC
// ========================================

r.get("/", list);

// ========================================
// ADMIN VIDEO LIST
// ========================================

r.get("/admin", protect, adminOnly, adminList);

// ========================================
// PROTECTED MOVIE
// ========================================

r.get("/:id", protect, getOne);

// ========================================
// ADMIN CRUD
// ========================================

r.post("/", protect, adminOnly, create);

r.patch("/:id", protect, adminOnly, update);

r.delete("/:id", protect, adminOnly, remove);

export default r;
