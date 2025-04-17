# Quizzy - Gamified Learning Platform

## Project Overview
Quizzy is an interactive quiz application designed for primary school students, featuring:
- Engaging student interface with gamification elements
- Comprehensive admin dashboard for content management
- REST API backend with JSON database (proof of concept)
- Email notifications for results and verification

## Key Features

### Student Experience
- 🎮 Interactive quiz interface with animations and transitions
- 📊 Detailed results with performance analytics and score breakdown
- 🏆 Achievement system with badges for progress milestones
- 📝 Question review with explanations and feedback
- 📧 Email results functionality with customizable templates
- ⏱️ Timed quizzes with visual countdown indicators
- 🔊 Sound effects for enhanced engagement
- 📱 Responsive design for various devices

### Admin Features
- 🔐 Secure authentication with role-based access control
- 📝 Full CRUD operations for quizzes and questions
- 👥 User management system with role assignment
- 📈 Analytics dashboard with interactive charts
- ⚙️ System configuration settings for quiz behavior
- 📜 Audit logging system for tracking user actions
- 📊 Performance metrics and quiz statistics
- 🗃️ Question bank management with categories and difficulty levels
- 📑 Email template customization

## Technical Specifications

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Styling**: Tailwind CSS + custom animations
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Charts**: Custom SVG-based components
- **Build**: Vite 5
- **Error Handling**: Custom error boundaries and graceful degradation

### Backend Stack
- **Server**: Express.js
- **Database**: JSON (proof of concept, ready for Supabase integration)
- **Authentication**: JWT-based with secure cookie storage
- **PDF Generation**: jsPDF
- **Email Service**: Integrated email functionality
- **Validation**: Server-side request validation
- **Error Handling**: Standardized error responses
- **Audit Logging**: Detailed activity tracking

### Testing
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Supertest for API endpoint testing
- **Component Tests**: Isolated component testing
- **Coverage**: Vitest coverage reports
- **Mocking**: Mock service workers for isolated testing

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
git clone https://github.com/yourusername/quizzy.git
cd quizzy
npm install
```

### Running the Application
```bash
# Start both frontend and backend
npm start

# Frontend only (development)
npm run dev

# Backend only (development)
npm run server

# Production build
npm run build
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run coverage

# Run E2E tests
npm run test:e2e
```

## Environment Variables
Create a `.env` file in the root directory with:
```
VITE_API_BASE_URL=http://localhost:3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
BASE_URL=http://localhost:5173
```

## Project Structure
```
src/
├── api/            # API service modules
│   ├── admin.ts    # Admin API methods
│   ├── auth.ts     # Authentication methods
│   ├── data.ts     # Data retrieval methods
│   ├── quiz.ts     # Quiz-related API methods 
│   └── reports.ts  # Reporting API methods
├── components/     # Reusable components
│   ├── admin/      # Admin-specific components
│   ├── animations/ # Animation components
│   └── layouts/    # Layout components
├── data/           # Mock data and types
├── layouts/        # Page layout templates
├── mocks/          # Mock data for testing
├── pages/          # Page components
│   ├── admin/      # Admin interface pages
│   ├── student/    # Student interface pages
│   └── __tests__/  # Page component tests
├── services/       # Business logic services
├── styles/         # Global styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Features in Detail

### Quiz Engine
- Multi-step quiz flow with progress tracking
- Configurable time limits per quiz or question
- Support for multiple question types (multiple choice, true/false)
- Question difficulty levels (easy, medium, hard)
- Immediate or delayed feedback options
- Anti-cheating mechanisms

### Admin Dashboard
- Real-time analytics with performance metrics
- User activity monitoring and audit logs
- Quiz creation wizard with multi-step interface
- Question bank management with search and filters
- System settings configuration
- User management with role assignment

### Student Dashboard
- Quiz selection interface with search functionality
- Interactive quiz experience with animations
- Detailed results analysis
- Achievement tracking and badges
- Progress visualization

### Authentication System
- JWT-based authentication
- Role-based authorization (admin, student)
- Password reset functionality
- Email verification
- Session management

## Sound Effects Requirements

The application requires the following sound effects to be placed in the `public/sounds` directory:

- `correct.mp3` - A cheerful, positive sound for correct answers
- `wrong.mp3` - A gentle, non-discouraging sound for incorrect answers
- `click.mp3` - A soft click sound for button interactions
- `success.mp3` - A celebratory sound for completing quizzes
- `achievement.mp3` - An exciting sound for unlocking achievements

Recommended sound characteristics:
- Duration: 0.5-2 seconds
- Format: MP3
- Quality: 128-192 kbps
- Child-friendly and non-startling

You can obtain suitable sound effects from:
1. [Pixabay Audio](https://pixabay.com/sound-effects/) (Free, Attribution not required)
2. [Freesound](https://freesound.org/) (Free with attribution)
3. [Mixkit](https://mixkit.co/free-sound-effects/) (Free for commercial use)

Place the downloaded sound files in the `public/sounds` directory with the exact filenames mentioned above.

## Achievement System

The application includes an achievement system to gamify the learning experience:

- **First Steps**: Awarded for completing the first quiz
- **Speed Demon**: Awarded for completing a quiz in less than half the time limit
- **Perfect Score**: Awarded for achieving 100% on any quiz
- **Quick Learner**: Awarded for completing 5 quizzes with passing scores
- **Excellence Badge**: Awarded for achieving 90%+ on any quiz

Additional achievements can be configured in the database.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/reset-password` - Password reset

### Quiz Management
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a single quiz
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz

### Question Management
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get a single question
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question

### Results and Statistics
- `POST /api/results` - Submit quiz results
- `GET /api/results/stats` - Get quiz statistics
- `GET /api/questions/stats` - Get question statistics
- `GET /api/admin/stats` - Get admin dashboard statistics

## Deployment
The application can be deployed to:
- Vercel
- Netlify
- Any Node.js hosting platform
- Docker containers

## License
MIT License - See LICENSE file for details

## Roadmap
- [ ] Supabase integration for persistent database
- [ ] Real-time analytics with Socket.io
- [ ] Mobile app version with React Native
- [ ] Teacher dashboard for classroom management
- [ ] Advanced question types (drag & drop, matching)
- [ ] AI-powered question generation
- [ ] Localization support for multiple languages
- [ ] Offline mode with local storage
- [ ] Integration with learning management systems
- [ ] Social sharing functionality
