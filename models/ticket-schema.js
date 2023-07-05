const mongoose = require("mongoose");
// Define schema for the collection
const ticketSchema = new mongoose.Schema({
  messageID: {
    type: String,
    required: true,
  },
  userIDs: {
    type: Array,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

// Create a mongoose model for the collection
module.exports = mongoose.model("ticketNo", ticketSchema);
