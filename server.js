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

// Get a single question by ID
app.get('/api/questions/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!Array.isArray(db.questions)) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = db.questions.find(q => q.id === id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Submit quiz results
app.post('/api/results', (req, res, next) => {
  try {
    const { studentName, score, totalQuestions, answers, timestamp, timeRemaining } = req.body;
    if (!studentName || score === undefined || !totalQuestions || !answers || !timestamp) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const db = readDatabase();
    
    // Initialize required data structures if they don't exist
    if (!db.results) {
      db.results = [];
    }
    if (!db.userAchievements) {
      db.userAchievements = {};
    }
    if (!db.stats) {
      db.stats = {
        totalAttempts: 0,
        completedAttempts: 0,
        totalScore: 0
      };
    }
    
    // Create student entry if needed
    if (!db.userAchievements[studentName]) {
      db.userAchievements[studentName] = [];
      console.log(`Created new user record for: ${studentName}`);
    }

    // Calculate quiz completion data based on settings
    const settings = db.settings || { passingScore: 70 };
    const percentage = (score / totalQuestions) * 100;
    const completed = percentage >= settings.passingScore;

    // Create the new result object
    const newResult = {
      id: Date.now().toString(),
      studentName,
      score,
      totalQuestions,
      answers,
      timestamp,
      timeRemaining,
      completed,
      percentage
    };

    // STEP 1: Save the result to the database first
    db.results.push(newResult);
    
    // Update global statistics
    db.stats.totalAttempts++;
    if (completed) {
      db.stats.completedAttempts++;
    }
    db.stats.totalScore += percentage;
    
    // Save the database with the new result before calculating achievements
    writeDatabase(db);
    
    // STEP 2: After saving results, calculate achievements
    const earnedAchievements = [];
    
    // Calculate user-specific stats based on all their saved results
    const userResults = db.results.filter(r => r.studentName === studentName);
    const isFirstQuiz = userResults.length === 1;
    
    // First Steps achievement - automatic for first quiz
    if (isFirstQuiz) {
      earnedAchievements.push(1); // First Steps achievement ID
    }
    
    // Perfect Score achievement
    if (percentage === 100) {
      earnedAchievements.push(3); // Perfect Score achievement ID
    }
    
    // Excellence Badge achievement (90%+)
    if (percentage >= 90 && percentage < 100) {
      earnedAchievements.push(6); // Excellence Badge achievement ID
    }
    
    // Speed Demon achievement
    if (timeRemaining && settings.quizTimeLimit) {
      const timeRemainingPercent = (timeRemaining / (settings.quizTimeLimit * 60)) * 100;
      if (timeRemainingPercent >= 50) {
        earnedAchievements.push(2); // Speed Demon achievement ID
      }
    }
    
    // Quick Learner achievement (5 passed quizzes)
    const passedQuizzes = userResults.filter(r => r.completed).length;
    if (passedQuizzes >= 5 && !db.userAchievements[studentName].includes(4)) {
      earnedAchievements.push(4); // Quick Learner achievement ID
    }
    
    // Knowledge Master achievement (90%+ avg across 10+ quizzes)
    if (userResults.length >= 10) {
      const avgScore = userResults.reduce((acc, r) => acc + r.percentage, 0) / userResults.length;
      if (avgScore >= 90 && !db.userAchievements[studentName].includes(5)) {
        earnedAchievements.push(5); // Knowledge Master achievement ID
      }
    }
    
    // STEP 3: Apply earned achievements
    const newAchievements = earnedAchievements.filter(id => 
      !db.userAchievements[studentName].includes(id)
    );
    
    if (newAchievements.length > 0) {
      db.userAchievements[studentName].push(...newAchievements);
      
      // Update earned count for each achievement
      newAchievements.forEach(id => {
        const achievement = db.achievements?.find(a => a.id === id);
        if (achievement) {
          achievement.earnedCount = (achievement.earnedCount || 0) + 1;
        }
      });
      
      // Log achievement earnings
      logAdminActivity('system', 'ACHIEVEMENT_EARNED', {
        studentName,
        achievements: newAchievements
      });
      
      console.log(`User ${studentName} earned achievements: ${newAchievements.join(', ')}`);
      
      // Save the database again with the updated achievements
      writeDatabase(db);
    }

    // Log activity for analytics
    logAdminActivity('system', 'QUIZ_SUBMISSION', {
      studentId: studentName,
      quizId: answers[0]?.quizId,
      score: `${score}/${totalQuestions}`,
      percentage: percentage.toFixed(1) + '%',
      completed,
      timeRemaining,
      newAchievements: newAchievements
    });

    res.status(201).json({ 
      ...newResult,
      earnedAchievements: newAchievements // Include newly earned achievements in response
    });
  } catch (error) {
    console.error('Error submitting quiz result:', error);
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
      performanceTrend: calculatePerformanceTrend(validResults)
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

function generateRecentActivity(results) {
  return results
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(r => ({
      type: 'quiz_completion',
      user: r.studentName,
      score: Math.round((r.score / r.totalQuestions) * 100), // Calculate percentage correctly
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
        score: typeof r.score === 'number' && typeof r.totalQuestions === 'number' 
          ? Math.round((r.score / r.totalQuestions) * 100) 
          : 0
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
    const results = db.results || [];

    // Calculate score distribution
    const scoreDistribution = Array.from({ length: 11 }, (_, i) => i * 10)
      .map(score => {
        const count = results.filter(r => {
          if (!r || typeof r.score !== 'number' || !r.totalQuestions) return false;
          const percentage = (r.score / r.totalQuestions) * 100;
          return percentage >= score && percentage < score + 10;
        }).length;
        return { score, count };
      });

    // Calculate completion trend
    const completionTrend = calculatePerformanceTrend(results).map(day => ({
      date: day.date,
      completions: day.attempts || 0
    }));

    // Calculate stats using helper functions
    const stats = {
      totalAttempts: results.length,
      averageScore: calculateAverageScore(results),
      completionRate: calculateCompletionRate(results),
      scoreDistribution,
      completionTrend,
      performanceTrend: calculatePerformanceTrend(results)
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Calculate performance trend by aggregating scores per day
const calculatePerformanceTrend = (results) => {
  if (!results || !Array.isArray(results)) return [];

  // Get last 7 days
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i)); // Count from 6 days ago to today
    return date.toISOString().split('T')[0];
  });

  // Create a map for quick lookup of scores by date
  const scoresByDate = last7Days.reduce((acc, date) => {
    acc[date] = {
      totalScore: 0,
      attempts: 0
    };
    return acc;
  }, {});

  // Aggregate scores for each date
  results.forEach(result => {
    if (!result || !result.timestamp || typeof result.score !== 'number' || !result.totalQuestions) return;
    
    const date = new Date(result.timestamp).toISOString().split('T')[0];
    if (scoresByDate[date]) {
      scoresByDate[date].totalScore += (result.score / result.totalQuestions) * 100;
      scoresByDate[date].attempts++;
    }
  });

  // Convert to trend data format with averages
  return last7Days.map(date => ({
    date,
    averageScore: scoresByDate[date].attempts > 0 
      ? Math.round((scoresByDate[date].totalScore / scoresByDate[date].attempts) * 10) / 10 
      : 0,
    attempts: scoresByDate[date].attempts
  }));
};

// Get questions statistics
app.get('/api/questions/stats', (req, res, next) => {
  try {
    const db = readDatabase();
    const questions = db.questions || [];
    const results = db.results || [];

    const questionStats = questions.map(question => {
      // Only count attempts where the question exists and was actually answered
      const attempts = results.filter(r => 
        r && r.answers && Array.isArray(r.answers) &&
        r.answers.some(a => a && a.questionId === question.id)
      );
      
      // Only count correct answers for valid attempts
      const correctAnswers = attempts.filter(r =>
        r.answers.some(a => 
          a && a.questionId === question.id && a.correct
        )
      );

      return {
        id: question.id,
        text: question.text || question.question || '',
        totalAttempts: attempts.length,
        correctAnswers: correctAnswers.length,
        accuracy: attempts.length 
          ? (correctAnswers.length / attempts.length) * 100 
          : 0,
        averageTime: calculateAverageTime(attempts, question.id)
      };
    });

    res.json(questionStats);
  } catch (error) {
    next(error);
  }
});

// Keep only one instance of calculateAverageTime function
const calculateAverageTime = (attempts, questionId) => {
  if (!attempts || !Array.isArray(attempts)) return 0;
  
  const times = attempts
    .filter(r => r && r.answers && Array.isArray(r.answers))
    .map(r => {
      const answer = r.answers.find(a => a && a.questionId === questionId);
      return answer?.timeSpent || 0;
    })
    .filter(time => typeof time === 'number' && time > 0);
  
  if (!times.length) return 0;
  
  // Remove outliers (times that are more than 2 standard deviations from mean)
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
  const stdDev = Math.sqrt(times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length);
  const validTimes = times.filter(time => Math.abs(time - mean) <= 2 * stdDev);
  
  return validTimes.length ? Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length) : 0;
};

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
      // Initialize default settings with all required fields
      db.settings = {
        quizTimeLimit: 30,
        passingScore: 70,
        maxQuestions: 10,
        requireEmailVerification: false,
        allowRetakes: true,
        showResults: true,
        maxAttempts: 3,
        feedbackMode: 'afterSubmission',
        gradingScheme: 'percentage'
      };
      writeDatabase(db);
    }
    res.json(db.settings);
  } catch (error) {
    next(error);
  }
});

// Update admin settings
app.put('/api/admin/settings', (req, res) => {
  try {
    const { settings } = req.body; // Expect settings object in the body
    if (!settings) {
      return res.status(400).json({ error: 'Missing settings data in request body' });
    }

    // Validate the received settings object
    const validationErrors = validatePartialSettings(settings);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    const db = readDatabase();
    // Merge partial settings with existing ones
    db.settings = { ...db.settings, ...settings };
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'SETTINGS_UPDATED', { updatedFields: Object.keys(settings) });

    res.json({ message: 'Settings updated successfully', settings: db.settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

const validatePartialSettings = (settingsToValidate) => { // Renamed parameter
  const validationRules = {
    quizTimeLimit: { type: 'number', min: 1, max: 180 },
    passingScore: { type: 'number', min: 0, max: 100 },
    maxQuestions: { type: 'number', min: 1, max: 100 },
    requireEmailVerification: { type: 'boolean' },
    allowRetakes: { type: 'boolean' },
    showResults: { type: 'boolean' },
    maxAttempts: { type: 'number', min: 1, max: 10 },
    feedbackMode: { type: 'string', values: ['immediate', 'afterSubmission', 'never'] },
    gradingScheme: { type: 'string', values: ['percentage', 'points', 'custom'] }
  };

  const errors = [];
  
  // Validate against the settingsToValidate object directly
  Object.entries(settingsToValidate).forEach(([field, value]) => {
    const rule = validationRules[field];
    if (!rule) {
      // errors.push(`Unknown field: ${field}`); // Commented out - allow extra fields for now
      return; // Skip unknown fields for flexibility, or uncomment to enforce strictness
    }

    if (typeof value !== rule.type) {
      errors.push(`Field '${field}' must be type ${rule.type}, but received ${typeof value}`);
      return; // Stop further validation for this field if type is wrong
    }

    if (rule.type === 'number') {
      if (value < rule.min || value > rule.max) {
        errors.push(`Field '${field}' must be between ${rule.min} and ${rule.max}`);
      }
    }

    if (rule.type === 'string' && rule.values && !rule.values.includes(value)) {
      errors.push(`Field '${field}' must be one of: ${rule.values.join(', ')}`);
    }
  });

  return errors;
};

// Add new endpoint to reset settings to defaults
app.post('/api/admin/settings/reset', (req, res, next) => {
  try {
    const defaultSettings = {
      quizTimeLimit: 30,
      passingScore: 70,
      maxQuestions: 10,
      requireEmailVerification: false,
      allowRetakes: true,
      showResults: true,
      maxAttempts: 3,
      feedbackMode: 'afterSubmission',
      gradingScheme: 'percentage'
    };

    const db = readDatabase();
    db.settings = defaultSettings;
    writeDatabase(db);

    res.json({ 
      message: 'Settings reset to defaults', 
      settings: defaultSettings 
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ 
      error: 'Failed to reset settings',
      details: [error.message]
    });
  }
});

// Add users endpoints
app.get('/api/users', (req, res) => {
  try {
    const db = readDatabase();
    const users = db.users || [];
    // Remove sensitive data
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { username, email, role } = req.body;
    const db = readDatabase();
    
    if (!db.users) {
      db.users = [];
    }

    // Check for existing user
    if (db.users.some(u => u.email === email || u.username === username)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'CREATE_USER', {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role
    });

    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readDatabase();
    
    if (!db.users) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow updating sensitive fields directly
    const { password, ...safeUpdates } = updates;
    
    const updatedUser = {
      ...db.users[userIndex],
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    };

    db.users[userIndex] = updatedUser;
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'UPDATE_USER', {
      userId: id,
      username: updatedUser.username,
      changes: Object.keys(safeUpdates).join(', ')
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!db.users) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the activity before deletion
    logAdminActivity('admin', 'DELETE_USER', {
      userId: id,
      username: user.username,
      role: user.role
    });

    db.users = db.users.filter(u => u.id !== id);
    writeDatabase(db);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
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

    // Log the activity
    logAdminActivity('admin', 'CREATE_QUIZ', { 
      quizId: newQuiz.id,
      title: newQuiz.title 
    });

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

    const updatedQuiz = {
      ...db.quizzes[quizIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.quizzes[quizIndex] = updatedQuiz;
    
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'UPDATE_QUIZ', {
      quizId: id,
      title: updatedQuiz.title,
      changes: Object.keys(updates).join(', ')
    });

    res.json(updatedQuiz);
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
    
    const quiz = db.quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Log the activity before deletion
    logAdminActivity('admin', 'DELETE_QUIZ', {
      quizId: id,
      title: quiz.title
    });
    
    db.quizzes = db.quizzes.filter(q => q.id !== id);
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
    if (!db.achievements) {
      db.achievements = [
        {
          id: 1,
          name: "First Steps",
          description: "Complete your first quiz",
          icon: "star",
          isActive: true,
          conditions: {
            quizzes_completed: 1
          },
          earnedCount: 0
        },
        {
          id: 2,
          name: "Speed Demon",
          description: "Complete a quiz in less than half the time limit",
          icon: "zap",
          isActive: true,
          conditions: {
            time_remaining_percent: 50
          },
          earnedCount: 0
        },
        {
          id: 3,
          name: "Perfect Score",
          description: "Get 100% on any quiz",
          icon: "award",
          isActive: true,
          conditions: {
            score_percent: 100
          },
          earnedCount: 0
        },
        {
          id: 4,
          name: "Quick Learner",
          description: "Complete 5 quizzes with passing scores",
          icon: "brain",
          isActive: true,
          conditions: {
            passed_quizzes: 5
          },
          earnedCount: 0
        },
        {
          id: 5,
          name: "Knowledge Master",
          description: "Maintain a 90%+ average across 10 quizzes",
          icon: "trophy",
          isActive: true,
          conditions: {
            min_average: 90,
            min_quizzes: 10
          },
          earnedCount: 0
        },
        {
          id: 6,
          name: "Excellence Badge",
          description: "Score 90% or higher on any quiz",
          icon: "award",
          isActive: true,
          conditions: {
            score_percent: 90
          },
          earnedCount: 0
        }
      ];
      writeDatabase(db);
    } else {
      // Check if Excellence Badge exists, add it if it doesn't
      if (!db.achievements.some(a => a.id === 6 && a.name === "Excellence Badge")) {
        db.achievements.push({
          id: 6,
          name: "Excellence Badge",
          description: "Score 90% or higher on any quiz",
          icon: "award",
          isActive: true,
          conditions: {
            score_percent: 90
          },
          earnedCount: 0
        });
        writeDatabase(db);
        console.log("Added Excellence Badge achievement to database");
      }
    }
    res.json(db.achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Debug endpoint to check available question IDs
app.get('/api/debug/questions', (req, res) => {
  try {
    const db = readDatabase();
    if (!Array.isArray(db.questions)) {
      return res.json({ questionsCount: 0, questionIds: [] });
    }
    
    const questionIds = db.questions.map(q => q.id);
    res.json({
      questionsCount: questionIds.length,
      questionIds
    });
  } catch (error) {
    console.error('Error fetching question IDs:', error);
    res.status(500).json({ error: 'Failed to fetch question IDs' });
  }
});

// Handle 404 errors - this should be after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const validateSettings = (settings) => {
  const validationRules = {
    quizTimeLimit: { type: 'number', min: 1, max: 180 },
    passingScore: { type: 'number', min: 0, max: 100 },
    maxQuestions: { type: 'number', min: 1, max: 100 },
    requireEmailVerification: { type: 'boolean' },
    allowRetakes: { type: 'boolean' },
    showResults: { type: 'boolean' },
    maxAttempts: { type: 'number', min: 1, max: 10 },
    feedbackMode: { type: 'string', values: ['immediate', 'afterSubmission', 'never'] },
    gradingScheme: { type: 'string', values: ['percentage', 'points', 'custom'] }
  };

  const errors = [];
  
  // Only validate fields that are being updated
  Object.entries(settings).forEach(([field, value]) => {
    const rules = validationRules[field];
    if (!rules) {
      errors.push(`Unknown field: ${field}`);
      return;
    }

    if (value === undefined || value === null) {
      errors.push(`Invalid value for ${field}: cannot be null or undefined`);
      return;
    }

    if (typeof value !== rules.type) {
      errors.push(`Invalid type for ${field}: expected ${rules.type}`);
      return;
    }

    if (rules.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${field} must be a valid number`);
      } else if (numValue < rules.min || numValue > rules.max) {
        errors.push(`${field} must be between ${rules.min} and ${rules.max}`);
      }
    }

    if (rules.values && !rules.values.includes(value)) {
      errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
    }
  });

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

// Initialize audit logs if not exists
const logAdminActivity = (userId, action, details = {}) => {
  try {
    const db = readDatabase();
    if (!db.auditLogs) {
      db.auditLogs = [];
    }
    
    const log = {
      id: Date.now().toString(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '', // In production, get from request
      userAgent: ''  // In production, get from request
    };
    
    db.auditLogs.push(log);
    writeDatabase(db);
    return log;
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Get audit logs
app.get('/api/admin/audit-logs', (req, res) => {
  try {
    const db = readDatabase();
    if (!db.auditLogs) {
      db.auditLogs = [];
      writeDatabase(db);
    }
    
    // Sort logs by timestamp in descending order
    const sortedLogs = db.auditLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    res.json(sortedLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Modify existing endpoints to log admin activities
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

    // Log the activity
    logAdminActivity('admin', 'CREATE_QUIZ', { 
      quizId: newQuiz.id,
      title: newQuiz.title 
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
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

    const updatedQuiz = {
      ...db.quizzes[quizIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.quizzes[quizIndex] = updatedQuiz;
    
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'UPDATE_QUIZ', {
      quizId: id,
      title: updatedQuiz.title,
      changes: Object.keys(updates).join(', ')
    });

    res.json(updatedQuiz);
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
    
    const quiz = db.quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Log the activity before deletion
    logAdminActivity('admin', 'DELETE_QUIZ', {
      quizId: id,
      title: quiz.title
    });
    
    db.quizzes = db.quizzes.filter(q => q.id !== id);
    writeDatabase(db);
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Achievement Management Endpoints
app.post('/api/achievements', (req, res) => {
  try {
    const { name, description, icon, conditions } = req.body;
    
    if (!name || !description || !icon || !conditions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDatabase();
    if (!db.achievements) {
      db.achievements = [];
    }

    const newAchievement = {
      id: Date.now(),
      name,
      description,
      icon,
      conditions,
      isActive: true,
      earnedCount: 0,
      createdAt: new Date().toISOString()
    };

    db.achievements.push(newAchievement);
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'CREATE_ACHIEVEMENT', {
      achievementId: newAchievement.id,
      name: newAchievement.name
    });

    res.status(201).json(newAchievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

app.put('/api/achievements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = readDatabase();
    
    if (!db.achievements) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const achievementIndex = db.achievements.findIndex(a => a.id === parseInt(id));
    if (achievementIndex === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updatedAchievement = {
      ...db.achievements[achievementIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.achievements[achievementIndex] = updatedAchievement;
    writeDatabase(db);

    // Log the activity
    logAdminActivity('admin', 'UPDATE_ACHIEVEMENT', {
      achievementId: id,
      name: updatedAchievement.name,
      changes: Object.keys(updates).join(', ')
    });

    res.json(updatedAchievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

app.delete('/api/achievements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    
    if (!db.achievements) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const achievement = db.achievements.find(a => a.id === parseInt(id));
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Log the activity before deletion
    logAdminActivity('admin', 'DELETE_ACHIEVEMENT', {
      achievementId: id,
      name: achievement.name
    });

    db.achievements = db.achievements.filter(a => a.id !== parseInt(id));
    writeDatabase(db);

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

app.post('/api/users/:studentName/achievements', (req, res) => {
  try {
    const { studentName } = req.params;
    const { achievements } = req.body;
    const db = readDatabase();

    if (!db.userAchievements) {
      db.userAchievements = {};
    }

    if (!db.userAchievements[studentName]) {
      db.userAchievements[studentName] = [];
    }

    // Add new achievements only if they don't exist
    const newAchievements = achievements.filter(id => 
      !db.userAchievements[studentName].includes(id)
    );

    if (newAchievements.length > 0) {
      db.userAchievements[studentName].push(...newAchievements);

      // Update earned count for each achievement
      newAchievements.forEach(id => {
        const achievement = db.achievements.find(a => a.id === id);
        if (achievement) {
          achievement.earnedCount = (achievement.earnedCount || 0) + 1;
        }
      });

      writeDatabase(db);

      // Log the activity
      logAdminActivity('system', 'ACHIEVEMENT_EARNED', {
        studentName,
        achievements: newAchievements
      });
    }

    res.json({ message: 'Achievements updated successfully' });
  } catch (error) {
    console.error('Error updating user achievements:', error);
    res.status(500).json({ error: 'Failed to update user achievements' });
  }
});

app.get('/api/users/:studentName/achievements', (req, res) => {
  try {
    const { studentName } = req.params;
    const db = readDatabase();

    if (!db.userAchievements) {
      db.userAchievements = {};
      writeDatabase(db);
    }

    if (!db.userAchievements[studentName]) {
      // Initialize achievements for new user and return empty array
      db.userAchievements[studentName] = [];
      writeDatabase(db);
      console.log(`Created new achievements record for user: ${studentName}`);
    }

    const achievementIds = db.userAchievements[studentName];
    
    // Make sure achievements array exists
    if (!db.achievements) {
      db.achievements = [];
      writeDatabase(db);
      return res.json([]);
    }
    
    // Filter valid achievements that user has earned
    const achievements = db.achievements.filter(a => achievementIds.includes(a.id));

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Add after the other app.get endpoints...

app.get('/api/users/:studentName/stats', (req, res) => {
  try {
    const { studentName } = req.params;
    const db = readDatabase();

    if (!db.results) {
      db.results = [];
      writeDatabase(db);
    }

    // Get all results for this user
    const userResults = db.results.filter(r => r.studentName === studentName);
    const passingScore = db.settings?.passingScore || 70;

    // Default stats for new users or users with no quiz attempts
    const stats = {
      totalQuizzes: userResults.length,
      quizzesCompleted: userResults.length,
      passedQuizzes: userResults.filter(r => 
        (r.score / r.totalQuestions) * 100 >= passingScore
      ).length,
      averageScore: userResults.length > 0 
        ? Math.round(userResults.reduce((acc, r) => 
            acc + ((r.score / r.totalQuestions) * 100), 0
          ) / userResults.length)
        : 0,
      recentAttempts: userResults
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(r => ({
          date: new Date(r.timestamp).toISOString().split('T')[0],
          score: Math.round((r.score / r.totalQuestions) * 100)
        }))
    };

    console.log(`Retrieved stats for user: ${studentName}`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Helper functions for statistics
function calculateAverageScore(results) {
  if (!results || !results.length) return 0;
  
  // Filter out invalid results
  const validResults = results.filter(r => 
    r && typeof r.score === 'number' && 
    typeof r.totalQuestions === 'number' && 
    r.totalQuestions > 0
  );

  if (!validResults.length) return 0;

  // Calculate percentage for each result then average
  const sum = validResults.reduce((acc, r) => {
    const percentage = (r.score / r.totalQuestions) * 100;
    return acc + percentage;
  }, 0);

  return Math.round((sum / validResults.length) * 10) / 10; // Round to 1 decimal
}

function calculateCompletionRate(results) {
  if (!results || !results.length) {
    return 0;
  }
  
  // Filter out invalid results
  const validResults = results.filter(r => 
    r && typeof r.score === 'number' && 
    typeof r.totalQuestions === 'number' && 
    r.totalQuestions > 0
  );

  if (!validResults.length) {
    return 0;
  }

  // A quiz is considered complete if score matches total questions or has completed flag
  const completed = validResults.filter(r => 
    r.completed || r.score === r.totalQuestions
  ).length;

  return Math.round((completed / validResults.length) * 100);
}
