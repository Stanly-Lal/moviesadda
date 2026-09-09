import validator from "validator";
import Video from "../models/Video.js";

function clean(payload) {
  const title = String(payload.title || "").trim();

  const posterUrl = String(payload.posterUrl || "").trim();

  const videoUrl = String(payload.videoUrl || "").trim();

  if (title.length < 2 || title.length > 140) {
    throw Object.assign(new Error("Title must be 2-140 characters"), {
      status: 400,
    });
  }

  for (const [name, url] of [
    ["Poster URL", posterUrl],
    ["Video URL", videoUrl],
  ]) {
    if (
      !validator.isURL(url, {
        require_protocol: true,
        protocols: ["http", "https"],
      })
    ) {
      throw Object.assign(new Error(`${name} must be a valid http/https URL`), {
        status: 400,
      });
    }
  }

  return {
    title,
    posterUrl,
    videoUrl,

    // ========================================
    // DOWNLOAD ONLY
    // ========================================

    downloadOnly:
      payload.downloadOnly === true || payload.downloadOnly === "true",
  };
}

// ========================================
// PUBLIC VIDEO LIST
// ========================================

export async function list(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit) || 12));

    const q = String(req.query.q || "").trim();

    const filter = q
      ? {
          $text: {
            $search: q,
          },
        }
      : {};

    const [items, total] = await Promise.all([
      Video.find(filter)
        .select("_id title posterUrl createdAt downloadOnly")
        .sort(
          q
            ? {
                score: {
                  $meta: "textScore",
                },
                createdAt: -1,
              }
            : {
                createdAt: -1,
              },
        )
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Video.countDocuments(filter),
    ]);

    res.json({
      items,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (e) {
    next(e);
  }
}

// ========================================
// ADMIN VIDEO LIST
// ========================================

export async function adminList(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));

    const items = await Video.find({})
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    res.json({
      items,
    });
  } catch (e) {
    next(e);
  }
}

// ========================================
// AUTHENTICATED MOVIE
// ========================================

export async function getOne(req, res, next) {
  try {
    const video = await Video.findById(req.params.id).lean();

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json(video);
  } catch (e) {
    next(e);
  }
}

// ========================================
// CREATE
// ========================================

export async function create(req, res, next) {
  try {
    const video = await Video.create(clean(req.body));

    res.status(201).json(video);
  } catch (e) {
    next(e);
  }
}

// ========================================
// UPDATE
// ========================================

export async function update(req, res, next) {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      clean(req.body),
      {
        new: true,
        runValidators: true,
      },
    );

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json(video);
  } catch (e) {
    next(e);
  }
}

// ========================================
// DELETE
// ========================================

export async function remove(req, res, next) {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json({
      message: "Video deleted",
    });
  } catch (e) {
    next(e);
  }
}
