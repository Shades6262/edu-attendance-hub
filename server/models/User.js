const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleUid; // Google-created users have no password
      },
    },
    googleUid: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "student" ? "approved" : "pending";
      },
    },
    barcodeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    instructorGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstructorGroup",
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },

    // email verification and password reset
    // token hashes are never returned by queries unless explicitly selected
    emailVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);