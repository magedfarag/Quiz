import express from 'express';
import cors from 'cors';
import fs from 'fs';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Email endpoints
app.post('/api/email/quiz-results', async (req, res, next) => {
  try {
    const { email, resultData } = req.body;
    if (!email || !resultData) {
      return res.status(400).json({ error: 'Missing email or result data' });
    }

    await sendQuizResults(email, resultData);
    res.json({ message: 'Quiz results email sent successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/email/verification', async (req, res, next) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'Missing email or token' });
    }

    await sendVerificationEmail(email, token);
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/email/reset-password', async (req, res, next) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'Missing email or token' });
    }

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
});

// Helper functions for sending emails
const sendQuizResults = async (email, resultData) => {
  await transporter.sendMail({
    from: 'Quizzy <noreply@quizzy.com>',
    to: email,
    subject: 'Your Quiz Results Are Here!',
    html: createQuizResultsEmailTemplate(resultData)
  });
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: 'Quizzy <noreply@quizzy.com>',
    to: email,
    subject: 'Welcome to Quizzy!',
    html: createVerificationEmailTemplate(verificationLink)
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: 'Quizzy <noreply@quizzy.com>',
    to: email,
    subject: 'Reset Your Password - Quizzy',
    html: createPasswordResetEmailTemplate(resetLink)
  });
};

// Email templates
const createQuizResultsEmailTemplate = (resultData) => {
  // Move the existing template here
  // ...existing email template code...
};

const createVerificationEmailTemplate = (verificationLink) => {
  return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CC9F0, #7B2CBF); color: white; padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
        <h1>Welcome to Quizzy!</h1>
        <p>One quick step to start your learning adventure</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p>Hi there!</p>
        <p>We're excited to have you join our learning community. Please verify your email to get started:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #4CC9F0; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    </div>
  `;
};

const createPasswordResetEmailTemplate = (resetLink) => {
  return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CC9F0, #7B2CBF); color: white; padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
        <h1>Reset Your Password</h1>
        <p>Follow the link below to set a new password</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p>Hi there!</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #4CC9F0; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
