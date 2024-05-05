const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voting', {
useNewUrlParser: true,
useUnifiedTopology: true,
});

// Check if the connection is successful
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
console.log('Connected to MongoDB');
});

// Define schema for voters
const voterSchema = new mongoose.Schema({
address: { type: String, required: true, unique: true },
isRegistered: { type: Boolean, default: false },
hasVoted: { type: Boolean, default: false },
});

// Define schema for election results
const resultSchema = new mongoose.Schema({
candidateName: { type: String, required: true },
voteCount: { type: Number, default: 0 },
});

// Create models for the schemas
const VoterModel = mongoose.model('Voter', voterSchema);
const ResultModel = mongoose.model('Result', resultSchema);