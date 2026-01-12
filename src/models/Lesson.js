const { Schema, model, Types } = require("mongoose");

const lessonSchema = new Schema(
  {
    courseId: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    // Logical chapter identifier (NOT a separate collection)
    chapterId: {
      type: Types.ObjectId,
      required: true,
      index: true
    },

    // Display name of the chapter
    chapterTitle: {
      type: String,
      required: true,
      trim: true
    },

    // Order of this chapter inside the course
    chapterOrder: {
      type: Number,
      required: true
    },

    // Lesson info
    title: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["VIDEO", "PDF"],
      required: true
    },

    contentUrl: {
      type: String,
      required: true
    },

    // Order of this lesson inside its chapter
    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * Critical indexes for fast & correct ordering
 */
lessonSchema.index({ courseId: 1, chapterOrder: 1 });
lessonSchema.index({ courseId: 1, chapterId: 1, order: 1 });

module.exports = model("Lesson", lessonSchema);
