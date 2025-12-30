import mongoose from "mongoose";
import cards from "../seed/cardSeed.js";

const { Schema, model, models } = mongoose;

/* =======================
   Bingo Card Sub-Schema
======================= */
const cardSchema = new Schema(
  {
    number: {
      type: Number,
      enum: Array.from({ length: 100 }, (_, i) => i + 1),
      required: true,
    },
    numbers: {
      B: { type: [Number], default: [] },
      I: { type: [Number], default: [] },
      // Allows "FREE" in the center
      N: { type: [Schema.Types.Mixed], default: [] },
      G: { type: [Number], default: [] },
      O: { type: [Number], default: [] },
    },
    reserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

/* =======================
   Player Sub-Schema
======================= */
const playerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ready", "not_ready"],
      default: "not_ready",
    },
  },
  { _id: false }
);

/* =======================
   Called Number Sub-Schema
======================= */
const calledNumberSchema = new Schema(
  {
    letter: {
      type: String,
      enum: ["B", "I", "N", "G", "O"],
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    voice: {
      type: String, // e.g. "B-12"
      required: true,
    },
  },
  { _id: false }
);

/* =======================
   Game Session Schema
======================= */
const gameSessionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["waiting", "countdown", "ongoing", "completed"],
      default: "waiting",
    },

    bidAmount: {
      type: Number,
      required: true,
    },

    players: {
      type: [playerSchema],
      default: [],
    },

    cards: {
      type: [cardSchema],
      default: cards, // Pre-seeded 100 cards
    },
    // Full shuffled sequence (generated once)
    shuffledNumbers: {
      type: [calledNumberSchema],
      default: [],
    },

    // Numbers already called
    calledNumbers: {
      type: [calledNumberSchema],
      default: [],
    },

    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    winnerCard: {
      type: Number,
      default: null,
    },

    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },
    
    countdownStarted: { // <-- NEW FLAG
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GameSession = models.GameSession || model("GameSession", gameSessionSchema);
export default GameSession;
