import ChatHistory from "../models/chatHistory.js";
import cloudinary from "../config/cloudinary.js";

const chatSocket = (io, socket) => {
  /**
   * Listen for private chat messages
   * Payload: { toUserId, fromUserId, message, messageType, fileBuffers (optional array) }
   */
  socket.on("chat-message", async ({ toUserId, fromUserId, message, messageType, fileBuffers }) => {
    if (!toUserId || !fromUserId || (!message && (!fileBuffers || fileBuffers.length === 0))) return;

    // Create a unique room ID regardless of sender/receiver order
    const roomId = [toUserId, fromUserId].sort().join("-");
    socket.join(roomId);

    let finalMessages = [];

    try {
      // 1️⃣ Handle single text message
      if (message) {
        finalMessages.push({
          message,
          messageType: messageType || "text",
        });
      }

      // 2️⃣ Handle single or multiple files
      if (fileBuffers && fileBuffers.length > 0) {
        for (const fileBuffer of fileBuffers) {
          // Upload each file to Cloudinary
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(fileBuffer);
          });

          finalMessages.push({
            message: result.secure_url,
            messageType: result.resource_type, // "image", "video", etc.
          });
        }
      }

      // Save all messages to MongoDB and emit to the room
      for (const msg of finalMessages) {
        const chat = await ChatHistory.create({
          senderId: fromUserId,
          receiverId: toUserId,
          message: msg.message,
          messageType: msg.messageType,
          timestamp: new Date(),
        });

        io.to(roomId).emit("receivedMessage", {
          from: fromUserId,
          message: msg.message,
          messageType: msg.messageType,
          timestamp: chat.timestamp,
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      socket.emit("errorMessage", { error: "Message or file upload failed" });
    }
  });
};

export default chatSocket;
