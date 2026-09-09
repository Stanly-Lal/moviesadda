import mongoose from "mongoose";
import validator from "validator";
import User from "../models/User.js";
import { signToken, cookieOptions } from "../utils/token.js";
import { generateAvatarColor } from "../utils/avatarColor.js";

// ============================================================
// PUBLIC USER
// ============================================================

function publicUser(user) {
  return {
    _id: user._id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    state: user.state || "",
    avatarColor: user.avatarColor || null,
    role: user.role,
  };
}

// ============================================================
// MANAGED USER
// Used by admin user-management panel.
// NEVER includes password.
// ============================================================

function managedUser(user) {
  return {
    _id: user._id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    state: user.state || "",
    avatarColor: user.avatarColor || null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ============================================================
// ADMIN LOGIN
// ============================================================

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (
      !validator.isEmail(String(email || "")) ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Valid email and password required",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (
      !user ||
      user.role !== "admin" ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    res.cookie("token", signToken(user._id.toString()), cookieOptions());

    res.json({
      user: publicUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER REGISTRATION
// ============================================================

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, state } = req.body || {};

    const cleanFirstName = String(firstName || "").trim();
    const cleanLastName = String(lastName || "").trim();
    const cleanEmail = String(email || "")
      .toLowerCase()
      .trim();
    const cleanState = String(state || "").trim();

    if (!cleanFirstName) {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    if (cleanFirstName.length > 50) {
      return res.status(400).json({
        message: "First name is too long",
      });
    }

    if (cleanLastName.length > 50) {
      return res.status(400).json({
        message: "Last name is too long",
      });
    }

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (typeof password !== "string" || password.length < 10) {
      return res.status(400).json({
        message: "Password must be at least 10 characters",
      });
    }

    if (!cleanState) {
      return res.status(400).json({
        message: "State is required",
      });
    }

    const existing = await User.findOne({
      email: cleanEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password,
      state: cleanState,
      avatarColor: generateAvatarColor(),
      role: "user",
    });

    res.cookie("token", signToken(user._id.toString()), cookieOptions());

    res.status(201).json({
      message: "Account created successfully",
      user: publicUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER LOGIN
// ============================================================

export async function userLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (
      !validator.isEmail(String(email || "")) ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Valid email and password required",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (
      !user ||
      user.role !== "user" ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.avatarColor) {
      user.avatarColor = generateAvatarColor();
      await user.save();
    }

    res.cookie("token", signToken(user._id.toString()), cookieOptions());

    res.json({
      user: publicUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// LOGOUT
// ============================================================

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
    path: "/",
  });

  res.json({
    message: "Logged out",
  });
}

// ============================================================
// CURRENT USER
// ============================================================

export function me(req, res) {
  res.json({
    user: publicUser(req.user),
  });
}

// ============================================================
// CHANGE CURRENT ADMIN PASSWORD
// ============================================================

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 10) {
      return res.status(400).json({
        message: "New password must be at least 10 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const passwordCorrect = await user.comparePassword(currentPassword);

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// GET ADMINS
// Existing admin-management feature
// ============================================================

export async function getAdmins(req, res, next) {
  try {
    const admins = await User.find({
      role: "admin",
    })
      .select("_id email role createdAt")
      .sort({ createdAt: 1 });

    res.json({
      admins,
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// ADD ADMIN
// Existing admin-management feature
// ============================================================

export async function addAdmin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!validator.isEmail(String(email || ""))) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (typeof password !== "string" || password.length < 10) {
      return res.status(400).json({
        message: "Password must be at least 10 characters",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const admin = await User.create({
      email: normalizedEmail,
      password,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// DELETE ADMIN
// Existing admin-management feature
// ============================================================

export async function deleteAdmin(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid admin ID",
      });
    }

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        message: "You cannot remove your own admin account",
      });
    }

    const admin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const adminCount = await User.countDocuments({
      role: "admin",
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        message: "You cannot remove the last admin",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: "Admin removed successfully",
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER MANAGEMENT
// GET ALL USERS
// ============================================================

export async function getUsers(req, res, next) {
  try {
    const users = await User.find({})
      .select(
        "_id firstName lastName email state avatarColor role createdAt updatedAt",
      )
      .sort({ createdAt: -1 });

    res.json({
      users,
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER MANAGEMENT
// GET ONE USER
// ============================================================

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select(
      "_id firstName lastName email state avatarColor role createdAt updatedAt",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: managedUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER MANAGEMENT
// ADD USER
// ============================================================

export async function addUser(req, res, next) {
  try {
    const { firstName, lastName, email, password, state, role } =
      req.body || {};

    const cleanFirstName = String(firstName || "").trim();

    const cleanLastName = String(lastName || "").trim();

    const cleanEmail = String(email || "")
      .toLowerCase()
      .trim();

    const cleanState = String(state || "").trim();

    const cleanRole = String(role || "user")
      .trim()
      .toLowerCase();

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!cleanFirstName) {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    if (cleanFirstName.length > 50) {
      return res.status(400).json({
        message: "First name is too long",
      });
    }

    if (cleanLastName.length > 50) {
      return res.status(400).json({
        message: "Last name is too long",
      });
    }

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (typeof password !== "string" || password.length < 10) {
      return res.status(400).json({
        message: "Password must be at least 10 characters",
      });
    }

    if (!cleanState) {
      return res.status(400).json({
        message: "State is required",
      });
    }

    if (!["user", "admin"].includes(cleanRole)) {
      return res.status(400).json({
        message: "Role must be user or admin",
      });
    }

    // -------------------------
    // DUPLICATE EMAIL
    // -------------------------

    const existing = await User.findOne({
      email: cleanEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // -------------------------
    // CREATE
    // -------------------------

    const user = await User.create({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password,
      state: cleanState,
      avatarColor: generateAvatarColor(),
      role: cleanRole,
    });

    res.status(201).json({
      message: "User created successfully",
      user: managedUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER MANAGEMENT
// UPDATE USER
// ============================================================

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { firstName, lastName, email, password, state, role } =
      req.body || {};

    // ========================================================
    // SELF-PROTECTION
    // ========================================================

    const isSelf = String(req.user._id) === String(id);

    if (isSelf && role !== undefined && role !== user.role) {
      return res.status(400).json({
        message: "You cannot change your own administrator role",
      });
    }

    // ========================================================
    // FIRST NAME
    // ========================================================

    if (firstName !== undefined) {
      const cleanFirstName = String(firstName).trim();

      if (!cleanFirstName) {
        return res.status(400).json({
          message: "First name is required",
        });
      }

      if (cleanFirstName.length > 50) {
        return res.status(400).json({
          message: "First name is too long",
        });
      }

      user.firstName = cleanFirstName;
    }

    // ========================================================
    // LAST NAME
    // ========================================================

    if (lastName !== undefined) {
      const cleanLastName = String(lastName).trim();

      if (cleanLastName.length > 50) {
        return res.status(400).json({
          message: "Last name is too long",
        });
      }

      user.lastName = cleanLastName;
    }

    // ========================================================
    // EMAIL
    // ========================================================

    if (email !== undefined) {
      const cleanEmail = String(email).toLowerCase().trim();

      if (!validator.isEmail(cleanEmail)) {
        return res.status(400).json({
          message: "Valid email is required",
        });
      }

      if (cleanEmail !== user.email) {
        const existing = await User.findOne({
          email: cleanEmail,
          _id: { $ne: id },
        });

        if (existing) {
          return res.status(409).json({
            message: "An account with this email already exists",
          });
        }

        user.email = cleanEmail;
      }
    }

    // ========================================================
    // STATE
    // ========================================================

    if (state !== undefined) {
      const cleanState = String(state).trim();

      if (!cleanState) {
        return res.status(400).json({
          message: "State is required",
        });
      }

      if (cleanState.length > 80) {
        return res.status(400).json({
          message: "State is too long",
        });
      }

      user.state = cleanState;
    }

    // ========================================================
    // ROLE
    // ========================================================

    if (role !== undefined) {
      const cleanRole = String(role).trim().toLowerCase();

      if (!["user", "admin"].includes(cleanRole)) {
        return res.status(400).json({
          message: "Role must be user or admin",
        });
      }

      // ----------------------------------
      // Admin -> User
      // ----------------------------------

      if (user.role === "admin" && cleanRole === "user") {
        if (isSelf) {
          return res.status(400).json({
            message: "You cannot remove your own administrator access",
          });
        }

        const adminCount = await User.countDocuments({
          role: "admin",
        });

        if (adminCount <= 1) {
          return res.status(400).json({
            message: "You cannot demote the last admin",
          });
        }
      }

      user.role = cleanRole;
    }

    // ========================================================
    // PASSWORD
    // ========================================================

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 10) {
        return res.status(400).json({
          message: "Password must be at least 10 characters",
        });
      }

      user.password = password;
    }

    // ========================================================
    // AVATAR COLOR
    // ========================================================

    if (!user.avatarColor) {
      user.avatarColor = generateAvatarColor();
    }

    // ========================================================
    // SAVE
    //
    // IMPORTANT:
    // Using .save() ensures your existing bcrypt
    // pre-save middleware hashes a changed password.
    // ========================================================

    await user.save();

    res.json({
      message: "User updated successfully",
      user: managedUser(user),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// USER MANAGEMENT
// DELETE USER
// ============================================================

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // ========================================================
    // CANNOT DELETE SELF
    // ========================================================

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========================================================
    // LAST ADMIN PROTECTION
    // ========================================================

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "You cannot delete the last admin",
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (e) {
    next(e);
  }
}
