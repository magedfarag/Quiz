import express from 'express';
import cors from 'cors';
import fs from 'fs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Update CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Add CORS headers middleware for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());

const DB_PATH = './db.json';

// Initialize database if not exists
const initializeDatabase = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDb = {
        questions: [
          {
            id: '1',
            text: 'What is React?',
            options: ['A framework', 'A library', 'A language', 'A database'],
            correctAnswer: 'A library'
          }
        ],
        quizzes: [
          {
            id: '1',
            title: 'React Basics',
            description: 'Test your React knowledge',
            questions: ['1'],
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        results: [],
        users: [],
        settings: {},
        stats: {
          totalQuizzes: 1,
          activeUsers: 0,
          averageScore: 0,
          completionRate: 0,
          recentActivity: [],
          performanceTrend: []
        }
      };
      writeDatabase(defaultDb);
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    let needsUpdate = false;

    // Ensure questions array exists
    if (!db.questions) {
      db.questions = [];
      needsUpdate = true;
    }

    if (needsUpdate) {
      writeDatabase(db);
    }
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const readDatabase = () => {
  try {
    const db = initializeDatabase();
    return db;
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Database read error');
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Database write error');
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
    if (!Array.isArray(db.questions)) {
      db.questions = [];
      writeDatabase(db);
    }
    res.json(db.questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch questions',
      details: error.message 
    });
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
    
    // Ensure results array exists and has valid data
    const validResults = Array.isArray(db.results) ? db.results : [];
    
    const stats = {
      totalQuizzes: db.quizzes?.length || 0,
      activeUsers: db.users?.filter(u => u.status === 'active')?.length || 0,
      averageScore: calculateAverageScore(validResults),
      completionRate: calculateCompletionRate(validResults),
      recentActivity: generateRecentActivity(validResults),
      performanceTrend: generatePerformanceTrend(validResults)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin stats',
      details: error.message 
    });
  }
});

function calculateAverageScore(results) {
  if (!results.length) return 0;
  return results.reduce((sum, r) => sum + r.score, 0) / results.length;
}

function generateRecentActivity(results) {
  return results
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(r => ({
      type: 'quiz_completion',
      user: r.studentName,
      score: r.score,
      timestamp: r.timestamp
    }));
}

function generatePerformanceTrend(results) {
  try {
    // Filter out results without valid timestamps
    const validResults = results.filter(r => r && r.timestamp && !isNaN(new Date(r.timestamp).getTime()));
    
    // Sort by date, take last 7 days
    return validResults
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7)
      .map(r => ({
        date: new Date(r.timestamp).toISOString().split('T')[0],
        score: typeof r.score === 'number' ? r.score : 0
      }));
  } catch (error) {
    console.error('Error generating performance trend:', error);
    return []; // Return empty array as fallback
  }
}

// Get quiz results statistics
app.get('/api/results/stats', (req, res, next) => {
  try {
    const db = readDatabase();
    const stats = {
      totalAttempts: db.results.length,
      averageScore: db.results.reduce((sum, result) => sum + result.score, 0) / (db.results.length || 1),
      highestScore: Math.max(...db.results.map(r => r.score), 0),
      lowestScore: Math.min(...db.results.map(r => r.score), 0),
      recentAttempts: db.results.slice(-5),
      completionRate: (db.results.filter(r => r.completed).length / db.results.length) * 100 || 0
    };
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Keep only one questions stats endpoint with the most complete implementation
app.get('/api/questions/stats', (req, res, next) => {
  try {
    const db = readDatabase();
    const questionStats = db.questions.map(question => {
      const attempts = db.results.filter(r => 
        r.answers.some(a => a.questionId === question.id)
      );
      
      const correctAnswers = attempts.filter(r =>
        r.answers.find(a => a.questionId === question.id)?.correct
      );

      return {
        id: question.id,
        text: question.text.substring(0, 50) + '...',
        totalAttempts: attempts.length,
        correctAnswers: correctAnswers.length,
        accuracy: attempts.length ? (correctAnswers.length / attempts.length) * 100 : 0,
        averageResponseTime: calculateAverageTime(attempts, question.id)
      };
    });

    res.json(questionStats);
  } catch (error) {
    next(error);
  }
});

// Keep only one instance of calculateAverageTime function
function calculateAverageTime(attempts, questionId) {
  const times = attempts
    .map(r => r.answers.find(a => a.questionId === questionId)?.timeSpent || 0)
    .filter(time => time > 0);
  
  return times.length ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0;
}

// Helper function to calculate completion rate
function calculateCompletionRate(results) {
  const total = results.length;
  const completed = results.filter(r => r.completed).length;
  return total ? (completed / total) * 100 : 0;
}

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

// Admin Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = readDatabase();
    const admin = db.users.find(user => 
      user.email === email && 
      user.role === 'admin'
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = admin;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin settings
app.get('/api/admin/settings', (req, res, next) => {
  try {
    const db = readDatabase();
    if (!db.settings) {
      // Initialize default settings with expanded options
      db.settings = {
        quizTimeLimit: 30,
        passingScore: 70,
        allowRetakes: true,
        showResults: true,
        maxAttempts: 3,
        feedbackMode: 'afterSubmission',
        gradingScheme: 'percentage',
        analytics: {
          trackAnswerTime: true,
          collectFeedback: true
        },
        accessibility: {
          highContrast: false,
          fontSize: 'medium',
          extendedTimeLimit: false
        }
      };
      writeDatabase(db);
    }
    res.json(db.settings);
  } catch (error) {
    next(error);
  }
});

// Update admin settings
app.put('/api/admin/settings', (req, res, next) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid settings data',
        details: ['Settings object is required'] 
      });
    }

    const validationErrors = validateSettings(settings);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }

    const db = readDatabase();
    db.settings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    writeDatabase(db);

    res.json({ 
      message: 'Settings updated successfully',
      settings: db.settings
    });
  } catch (error) {
    next(error);
  }
});

// Add new endpoint to reset settings to defaults
app.post('/api/admin/settings/reset', (req, res, next) => {
  try {
    const defaultSettings = {
      quizTimeLimit: 30,
      passingScore: 70,
      allowRetakes: true,
      showResults: true,
      maxAttempts: 3,
      feedbackMode: 'afterSubmission',
      gradingScheme: 'percentage',
      analytics: {
        trackAnswerTime: true,
        collectFeedback: true
      },
      accessibility: {
        highContrast: false,
        fontSize: 'medium',
        extendedTimeLimit: false
      }
    };

    const db = readDatabase();
    db.settings = defaultSettings;
    writeDatabase(db);

    res.json({ 
      message: 'Settings reset to defaults', 
      settings: defaultSettings 
    });
  } catch (error) {
    next(error);
  }
});

// Add users endpoints
app.get('/api/users', (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.users || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, email, role = 'student' } = req.body;
    const db = readDatabase();
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      status: 'active',
      quizzesCompleted: 0,
      averageScore: 0,
      createdAt: new Date().toISOString()
    };

    if (!db.users) db.users = [];
    db.users.push(newUser);
    writeDatabase(db);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!db.users) {
      return res.status(404).json({ error: 'Users collection not found' });
    }

    const userIndex = db.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.users.splice(userIndex, 1);
    writeDatabase(db);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    const user = db.users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readDatabase();
    const userIndex = db.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeDatabase(db);
    res.json(db.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Helper functions for sending emails
const sendQuizResults = async (email, resultData) => {
  try {
    await transporter.sendMail({
      from: 'Quizzy <noreply@quizzy.com>',
      to: email,
      subject: 'Your Quiz Results Are Here! 🎉',
      html: createQuizResultsEmailTemplate(resultData)
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send quiz results email');
  }
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
  const percentage = (resultData.score / resultData.totalQuestions * 100).toFixed(1);
  const getGradeColor = () => {
    if (percentage >= 80) return '#2DC653';
    if (percentage >= 50) return '#4CC9F0';
    return '#FF914D';
  };

  return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CC9F0, #7B2CBF); color: white; padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
        <h1>Quiz Results</h1>
        <p>Great effort on completing the quiz!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 18px;">Hi ${resultData.studentName},</p>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0; color: ${getGradeColor()}; font-size: 36px;">
            ${resultData.score}/${resultData.totalQuestions}
          </h2>
          <p style="margin: 10px 0 0; font-size: 24px; color: ${getGradeColor()};">
            ${percentage}%
          </p>
        </div>
        
        <div style="margin-top: 30px;">
          <h3 style="color: #333; margin-bottom: 15px;">Key Takeaways:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
              ✨ You answered ${resultData.score} questions correctly
            </li>
            <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
              📈 Your performance is ${percentage >= 80 ? 'excellent!' : percentage >= 50 ? 'good!' : 'showing potential!'}
            </li>
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.BASE_URL || 'http://localhost:5173'}/review-quiz" 
             style="background: #4CC9F0; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Review Your Answers
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
          Keep learning and growing with Quizzy! 🌟
        </p>
      </div>
    </div>
  `;
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

// Quiz management endpoints
app.get('/api/quizzes', (req, res) => {
  try {
    const db = readDatabase();
    if (!db.quizzes) {
      db.quizzes = [];
    }
    res.json(db.quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.post('/api/quizzes', (req, res) => {
  try {
    const { title, description, questions, timeLimit, passingScore } = req.body;
    
    if (!title || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Title and questions array are required' });
    }

    const db = readDatabase();
    
    if (!db.quizzes) {
      db.quizzes = [];
    }

    const newQuiz = {
      id: Date.now().toString(),
      title,
      description,
      questions,
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 70,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.quizzes.push(newQuiz);
    writeDatabase(db);
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

app.get('/api/quizzes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!db.quizzes) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quiz = db.quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.put('/api/quizzes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readDatabase();
    
    if (!db.quizzes) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quizIndex = db.quizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    db.quizzes[quizIndex] = {
      ...db.quizzes[quizIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeDatabase(db);
    res.json(db.quizzes[quizIndex]);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

app.delete('/api/quizzes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!db.quizzes) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const initialLength = db.quizzes.length;
    db.quizzes = db.quizzes.filter(q => q.id !== id);
    
    if (db.quizzes.length === initialLength) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    writeDatabase(db);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Get achievements
app.get('/api/achievements', (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.achievements || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Handle 404 errors - this should be after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const validateSettings = (settings) => {
  const requiredFields = {
    quizTimeLimit: { type: 'number', min: 1, max: 180 },
    passingScore: { type: 'number', min: 0, max: 100 },
    allowRetakes: { type: 'boolean' },
    showResults: { type: 'boolean' },
    maxAttempts: { type: 'number', min: 1, max: 10 },
    feedbackMode: { type: 'string', values: ['immediate', 'afterSubmission', 'never'] },
    gradingScheme: { type: 'string', values: ['percentage', 'points', 'custom'] }
  };

  const errors = [];
  for (const [field, rules] of Object.entries(requiredFields)) {
    if (settings[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    if (typeof settings[field] !== rules.type) {
      errors.push(`Invalid type for ${field}: expected ${rules.type}`);
      continue;
    }

    if (rules.type === 'number' && (settings[field] < rules.min || settings[field] > rules.max)) {
      errors.push(`${field} must be between ${rules.min} and ${rules.max}`);
    }

    if (rules.values && !rules.values.includes(settings[field])) {
      errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
    }
  }

  return errors;
};

// Quiz management endpoints
const ensureDatabase = () => {
  const db = readDatabase();
  if (!db.users) {
    db.users = [{
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      quizzesCompleted: 0,
      averageScore: 0,
      createdAt: new Date().toISOString()
    }];
    writeDatabase(db);
  }
  if (!db.quizzes) {
    db.quizzes = [{
      id: '1',
      title: 'Sample Quiz',
      description: 'A sample quiz to get started',
      questions: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
    writeDatabase(db);
  }
  return db;
};

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
