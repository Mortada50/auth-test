import mongoose from "mongoose";
import {
  weeklyScheduleSchema,
  addressSchema,
  locationSchema,
} from "./shared.schema.js";

const pharmacySchema = new mongoose.Schema(
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
      required: true,
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
    avatar: { type: String, default: null },
    bio: { type: String, trim: true },

    // ── Pharmacy Info ──
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "اسم الصيدلية يجب أن يكون حرفين على الأقل"],
      maxlength: [100, "اسم الصيدلية يجب ألا يتجاوز 100 حرف"],
    },
    pharmacyPhone: {
      type: String,
      match: [
        /^(?:\+967|00967)?(77|71|78|73)\d{7}$/,
        "الرجاء إدخال رقم يمني صالح",
      ],
    },
    pharmacyAddress: {
      type: addressSchema,
      required: true,
    },
    location: locationSchema,
    pharmacyLicense: {
      type: String,
      required: true, // URL من Cloudinary
    },

    // ── Schedule ──
    weeklySchedule: [weeklyScheduleSchema],

    // ── Medicines ──
    medicines: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
      },
    ],

    // ── Status ──
    isAvailable: {
      type: Boolean,
      default: false,
    },

    // ── Stats ──
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// ───── Indexes ─────
pharmacySchema.index({ location: "2dsphere" });
pharmacySchema.index({ "pharmacyAddress.city": 1 });
pharmacySchema.index({ isAvailable: 1 });

export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
