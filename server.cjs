const express = require('express');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default dev server port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const DB_PATH = './db.json';

// Helper function to read database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { questions: [], results: [] };
  }
};

// Helper function to write to database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to write to database');
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Get all quiz questions
app.get('/api/questions', (req, res, next) => {
  try {
    const db = readDatabase();
    if (!db.questions) {
      return res.status(404).json({ error: 'No questions found' });
    }
    res.json(db.questions);
  } catch (error) {
    next(error);
  }
});

// Submit quiz results
app.post('/api/results', (req, res, next) => {
  try {
    const { studentName, score, totalQuestions, answers, timestamp } = req.body;
    if (!studentName || score === undefined || !totalQuestions || !answers || !timestamp) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const db = readDatabase();
    const newResult = { id: db.results.length + 1, studentName, score, totalQuestions, answers, timestamp };
    db.results.push(newResult);
    writeDatabase(db);

    res.status(201).json(newResult);
  } catch (error) {
    next(error);
  }
});

// Send quiz results email
app.post('/api/email/quiz-results', async (req, res, next) => {
  try {
    const { email, resultData } = req.body;
    
    if (!email || !resultData) {
      return res.status(400).json({ error: 'Missing email or result data' });
    }

    const percentage = (resultData.score / resultData.totalQuestions * 100).toFixed(1);
    
    await transporter.sendMail({
      from: 'Quizzy <noreply@quizzy.com>',
      to: email,
      subject: 'Your Quiz Results Are Here!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Quiz Results</h1>
          <p>Dear ${resultData.studentName},</p>
          <p>You scored ${resultData.score}/${resultData.totalQuestions} (${percentage}%)</p>
          <p>Keep learning and growing!</p>
        </div>
      `
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    next(error);
  }
});

// Get admin statistics
app.get('/api/admin/stats', (req, res, next) => {
  try {
    const db = readDatabase();
    const totalQuizzes = db.questions.length;
    const activeUsers = db.results.length;
    const averageScore = db.results.reduce((sum, result) => sum + result.score, 0) / (db.results.length || 1);

    res.json({ totalQuizzes, activeUsers, averageScore });
  } catch (error) {
    next(error);
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
