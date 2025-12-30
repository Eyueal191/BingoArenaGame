import mongoose from "mongoose";

const { model, Schema, models } = mongoose;

// Define the schema for text-only chat history
const chatHistorySchema = new Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Export the model (use existing model if it exists)
const ChatHistory = models.ChatHistory || model("ChatHistory", chatHistorySchema);
export default ChatHistory;
