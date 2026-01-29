require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('./models/Exam');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');
        const exams = await Exam.find({}).select('-questions.correctOption');
        console.log('Exams found:', exams.length);
        process.exit(0);
    } catch (err) {
        console.error('Error during test:', err);
        process.exit(1);
    }
};

test();
