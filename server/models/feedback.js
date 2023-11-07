const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: String,
  itemId: String,
  helpful: Boolean,
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = { Feedback, feedbackSchema };
