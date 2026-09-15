import validator from "validator";
import Video from "../models/Video.js";

// ============================================================
// CLEAN / VALIDATE VIDEO DATA
// ============================================================

function clean(payload) {
  const title = String(payload.title || "").trim();

  const posterUrl = String(payload.posterUrl || "").trim();

  const videoUrl = String(payload.videoUrl || "").trim();

  const downloadable =
    payload.downloadable === true || payload.downloadable === "true";

  const downloadOnly =
    payload.downloadOnly === true || payload.downloadOnly === "true";

  let downloadType = String(payload.downloadType || "direct").trim();

  if (!["direct", "page"].includes(downloadType)) {
    downloadType = "direct";
  }

  const downloadUrl = String(payload.downloadUrl || "").trim();

  // ==========================================================
  // TITLE
  // ==========================================================

  if (title.length < 2 || title.length > 140) {
    throw Object.assign(new Error("Title must be 2-140 characters"), {
      status: 400,
    });
  }

  // ==========================================================
  // POSTER URL
  // ==========================================================

  if (
    !validator.isURL(posterUrl, {
      require_protocol: true,
      protocols: ["http", "https"],
    })
  ) {
    throw Object.assign(
      new Error("Poster URL must be a valid http/https URL"),
      {
        status: 400,
      },
    );
  }

  // ==========================================================
  // VIDEO / WATCH URL
  //
  // Required when:
  //
  // downloadable = false
  // OR
  // downloadOnly = false
  //
  // Not required for Download Only.
  // ==========================================================

  if (!downloadOnly) {
    if (
      !validator.isURL(videoUrl, {
        require_protocol: true,
        protocols: ["http", "https"],
      })
    ) {
      throw Object.assign(
        new Error("Video URL must be a valid http/https URL"),
        {
          status: 400,
        },
      );
    }
  }

  // ==========================================================
  // DOWNLOAD VALIDATION
  // ==========================================================

  if (downloadable) {
    // --------------------------------------------------------
    // Download URL is always required when downloads are
    // enabled.
    // --------------------------------------------------------

    if (!downloadUrl) {
      throw Object.assign(
        new Error("Download URL is required when downloads are enabled"),
        {
          status: 400,
        },
      );
    }

    if (
      !validator.isURL(downloadUrl, {
        require_protocol: true,
        protocols: ["http", "https"],
      })
    ) {
      throw Object.assign(
        new Error("Download URL must be a valid http/https URL"),
        {
          status: 400,
        },
      );
    }
  }

  // ==========================================================
  // DOWNLOAD ONLY VALIDATION
  // ==========================================================

  if (downloadOnly && !downloadable) {
    throw Object.assign(
      new Error("Download-only videos must have downloads enabled"),
      {
        status: 400,
      },
    );
  }

  // ==========================================================
  // GENERAL DESTINATION VALIDATION
  // ==========================================================

  if (!videoUrl && !downloadUrl) {
    throw Object.assign(
      new Error("Video must have either a watch URL or a download URL"),
      {
        status: 400,
      },
    );
  }

  // ==========================================================
  // RETURN CLEAN DATA
  // ==========================================================

  return {
    title,

    posterUrl,

    // Download-only videos intentionally have no watch URL.
    videoUrl: downloadOnly ? "" : videoUrl,

    downloadable,

    downloadOnly,

    // IMPORTANT:
    // Preserve "page" exactly.
    downloadType,

    downloadUrl: downloadable ? downloadUrl : "",
  };
}

// ============================================================
// NORMALIZE VIDEOS
// ============================================================

function normalizeVideo(video) {
  if (!video) {
    return video;
  }

  const normalized = {
    ...video,
  };

  // ==========================================================
  // LEGACY VIDEO DETECTION
  //
  // IMPORTANT FIX:
  //
  // We ONLY treat a record as legacy when the new
  // "downloadable" field does NOT exist as a boolean.
  //
  // This prevents NEW videos with:
  //
  // downloadable: true
  // downloadOnly: true
  // downloadType: "page"
  //
  // from being incorrectly converted to "direct".
  // ==========================================================

  const isLegacyDownloadOnly =
    typeof normalized.downloadable !== "boolean" &&
    normalized.downloadOnly === true;

  if (isLegacyDownloadOnly) {
    normalized.downloadable = true;

    normalized.downloadOnly = true;

    // Old system always behaved as direct download.
    normalized.downloadType = "direct";

    // Old records stored the download URL inside videoUrl.
    if (!normalized.downloadUrl) {
      normalized.downloadUrl = normalized.videoUrl || "";
    }

    // Old download-only records should never expose
    // their old videoUrl as a Watch URL.
    normalized.videoUrl = "";

    return normalized;
  }

  // ==========================================================
  // NEW DOWNLOAD SYSTEM
  // ==========================================================

  normalized.downloadable =
    typeof normalized.downloadable === "boolean"
      ? normalized.downloadable
      : false;

  normalized.downloadOnly = Boolean(normalized.downloadOnly);

  normalized.downloadType =
    normalized.downloadType === "page" ? "page" : "direct";

  normalized.downloadUrl = normalized.downloadUrl || "";

  normalized.videoUrl = normalized.videoUrl || "";

  return normalized;
}

// ============================================================
// PUBLIC VIDEO LIST
// ============================================================

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
        .select(
          "_id title posterUrl createdAt videoUrl downloadable downloadOnly downloadType downloadUrl",
        )
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
      items: items.map(normalizeVideo),

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

// ============================================================
// ADMIN VIDEO LIST
// ============================================================

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
      items: items.map(normalizeVideo),
    });
  } catch (e) {
    next(e);
  }
}

// ============================================================
// AUTHENTICATED MOVIE
// ============================================================

export async function getOne(req, res, next) {
  try {
    const video = await Video.findById(req.params.id).lean();

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json(normalizeVideo(video));
  } catch (e) {
    next(e);
  }
}

// ============================================================
// CREATE
// ============================================================

export async function create(req, res, next) {
  try {
    const cleaned = clean(req.body);

    const video = await Video.create(cleaned);

    res.status(201).json(normalizeVideo(video.toObject()));
  } catch (e) {
    next(e);
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function update(req, res, next) {
  try {
    const cleaned = clean(req.body);

    const video = await Video.findByIdAndUpdate(req.params.id, cleaned, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.json(normalizeVideo(video.toObject()));
  } catch (e) {
    next(e);
  }
}

// ============================================================
// DELETE
// ============================================================

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
