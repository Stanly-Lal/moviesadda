import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 140,
    },

    posterUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================================
    // WATCH / DESTINATION URL
    //
    // Empty when the video is DOWNLOAD ONLY.
    // ==========================================================

    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================================
    // DOWNLOAD SETTINGS
    // ==========================================================

    downloadable: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // DOWNLOAD ONLY
    //
    // true  = Watch button is hidden
    // false = Watch button can be shown
    //
    // IMPORTANT:
    // This field is now used by the NEW system as well.
    // ==========================================================

    downloadOnly: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // DOWNLOAD TYPE
    //
    // direct = third-party direct download
    // page   = third-party download page
    // ==========================================================

    downloadType: {
      type: String,
      enum: ["direct", "page"],
      default: "direct",
    },

    // ==========================================================
    // DOWNLOAD URL
    // ==========================================================

    downloadUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// SEARCH INDEX
// ============================================================

videoSchema.index({
  title: "text",
  createdAt: -1,
});

export default mongoose.model("Video", videoSchema);
