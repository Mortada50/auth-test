import mongoose from "mongoose";
import { BLOOD_TYPES } from "../utils/constants.js";

const medicalHistorySchema = new mongoose.Schema(
  {
    bloodType: {
      type: String,
      enum: BLOOD_TYPES,
      default: "unknown",
    },
    allergies: { type: String, trim: true },
    chronicDiseases: { type: String, trim: true },
    height: {
      type: Number,
      min: [50, "الطول يجب أن يكون 50 سم على الأقل"],
      max: [250, "الطول يجب ألا يتجاوز 250 سم"],
    },
    weight: {
      type: Number,
      min: [2, "الوزن يجب أن يكون 2 كغ على الأقل"],
      max: [300, "الوزن يجب ألا يتجاوز 300 كغ"],
    },
    badHabits: { type: String, trim: true },
    previousSurgeries: { type: String, trim: true },
  },
  { _id: false },
);

const patientSchema = new mongoose.Schema(
  {
    // ── Clerk Auth ──
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ── Personal Info ──
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: {
      type: String,
      trim: true,
      minlength: [2, "الاسم يجب أن يكون حرفين على الأقل"],
      maxlength: [100, "الاسم يجب ألا يتجاوز 100 حرف"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    avatar: { type: String, default: null },
    phone: {
      type: String,
      match: [
        /^(?:\+967|00967)?(77|71|78|73)\d{7}$/,
        "الرجاء إدخال رقم يمني صالح",
      ],
    },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true },

    // ── Medical History ──
    medicalHistory: {
      type: medicalHistorySchema,
      default: () => ({}),
    },

    // ── Status ──
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Patient = mongoose.model("Patient", patientSchema);
