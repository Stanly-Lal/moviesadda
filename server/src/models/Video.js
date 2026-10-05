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
    // ==========================================================

    sandboxEnabled: {
      type: Boolean,
      default: false,
    },

    orientationLock: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // IFRAME REFERRER POLICY
    //
    // Controls the Referrer-Policy used by this video's iframe.
    //
    // no-referrer:
    // Sends no referrer information to the embedded player.
    //
    // strict-origin:
    // Sends only the origin for cross-origin HTTPS requests.
    // ==========================================================

    referrerPolicy: {
      type: String,
      enum: ["no-referrer", "strict-origin-when-cross-origin"],
      default: "no-referrer",
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
