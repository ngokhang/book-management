import mongoose, { Schema } from "mongoose";
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  RESET_PASSWORD_TOKEN,
} from "../constants/index.js";
import autopopulate from "mongoose-autopopulate";

const tokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Token",
      required: true,
      autopopulate: true,
    },
    typeToken: {
      type: String,
      enum: [REFRESH_TOKEN, ACCESS_TOKEN, RESET_PASSWORD_TOKEN],
      required: true,
    },
    value: { type: String, required: true },
    expiresAt: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
).plugin(autopopulate);

export const Token = mongoose.model("Token", tokenSchema);
