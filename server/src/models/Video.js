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
      required: true,
      trim: true,
    },

    // ========================================
    // DOWNLOAD ONLY
    // ========================================

    downloadOnly: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

videoSchema.index({
  title: "text",
  createdAt: -1,
});

export default mongoose.model("Video", videoSchema);
