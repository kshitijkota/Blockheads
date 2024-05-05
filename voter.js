// voterModel.js
const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    username: { type: String, required: true },
    accountNumberHash: { type: String, required: true, unique: true },
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;