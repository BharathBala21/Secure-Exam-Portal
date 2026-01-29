require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('./models/Submission');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const subCount = await Submission.countDocuments();
        console.log('Submissions found:', subCount);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

test();
