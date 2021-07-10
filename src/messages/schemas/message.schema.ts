import { Schema } from "mongoose";

export const MessageSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },
    roomId: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    attachment: {
      type: String,
      required: false
    },
    userId: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);
