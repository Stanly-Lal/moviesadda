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

    downloadOnly: {
      type: Boolean,
      default: false,
    },

    downloadType: {
      type: String,
      enum: ["direct", "page"],
      default: "direct",
    },

    downloadUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================================
    // PLAYER SETTINGS
    //
    // These are independent settings for each video.
    //
    // sandboxEnabled:
    // Controls whether the iframe receives a sandbox attribute.
    //
    // orientationLock:
    // Controls whether the iframe receives the
    // "orientation-lock" permission.
    // ==========================================================

    sandboxEnabled: {
      type: Boolean,
      default: false,
    },

    orientationLock: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

videoSchema.index({
  title: "text",
  createdAt: -1,
});

export default mongoose.model("Video", videoSchema);
