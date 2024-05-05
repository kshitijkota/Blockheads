const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Web3 = require('web3');
const contractABI = require('./contractABI.json'); // Replace with your actual contract ABI
const contractAddress = '0xA72D8d4c4611c702dE430124A240E54fC78fA905'; // Replace with your actual contract address
const Voter = require('./voterModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voting', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Mongoose models
const voterSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    isRegistered: { type: Boolean, default: false },
    hasVoted: { type: Boolean, default: false },
});
const VoterModel = mongoose.model('Voter', voterSchema);

// Express app setup
const app = express();
app.use(bodyParser.json());

// Web3 setup
// Connect to Remix Web3 provider
const web3 = new Web3('https://remix.ethereum.org/#web3-provider');
const contract = new web3.eth.Contract(contractABI, contractAddress);

// API endpoints
const registeredAccountNumberHashes = new Set();

app.post('/register', async (req, res) => {
    const { username, accountNumberHash } = req.body;
    try {
        if (registeredAccountNumberHashes.has(accountNumberHash)) {
            throw new Error('Account number hash is already registered');
        }

        // Check if the account number hash is already registered in the database
        const existingVoter = await Voter.findOne({ accountNumberHash });
        if (existingVoter) {
            throw new Error('Account number hash is already registered');
        }

        // Register the voter in the smart contract
        await contract.methods.registerVoter().send({ from: web3.eth.defaultAccount });

        // Save the voter details in the database
        await new Voter({ username, accountNumberHash }).save();
        registeredAccountNumberHashes.add(accountNumberHash);

        res.json({ message: 'Voter registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/vote', async (req, res) => {
    const { address, candidateName } = req.body;
    try {
        if (!web3.utils.isAddress(address) || !candidateName) {
            throw new Error('Invalid address or candidate name');
        }

        const voter = await VoterModel.findOne({ address });
        if (!voter || !voter.isRegistered) {
            throw new Error('Voter is not registered');
        }

        if (voter.hasVoted) {
            throw new Error('Voter has already voted');
        }

        const candidates = await contract.methods.getCandidateList().call();
        if (!candidates.includes(candidateName)) {
            throw new Error('Candidate does not exist');
        }

        await contract.methods.castVote(candidateName).send({ from: address });

        voter.hasVoted = true;
        await voter.save();

        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/candidates', async (req, res) => {
    try {
        const candidates = await contract.methods.getCandidateList().call();
        res.json(candidates);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start listening for events emitted by the smart contract
contract.events.allEvents()
    .on('data', event => {
        console.log('Event:', event.event, event.returnValues);
    })
    .on('error', error => {
        console.error('Event error:', error);
    });

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Documentation endpoint
app.get('/', (req, res) => {
    res.json({
        endpoints: {
            register: {
                description: 'Register a voter',
                method: 'POST',
                path: '/register',
                body: {
                    address: 'String (Ethereum address)',
                },
            },
            vote: {
                description: 'Cast a vote',
                method: 'POST',
                path: '/vote',
                body: {
                    address: 'String (Ethereum address)',
                    candidateName: 'String (Candidate name)',
                },
            },
            candidates: {
                description: 'Get the list of candidates',
                method: 'GET',
                path: '/candidates',
            },
        },
    });
});
