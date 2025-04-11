import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../api/quiz';
import { Brain, Star, Award, Rocket } from 'lucide-react';
import { useSoundEffects, preloadSounds } from '../utils/sounds';

const HomePage: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSoundEffects();

  useEffect(() => {
    preloadSounds();
  }, []);

  const handleStartQuiz = async () => {
    playClick();
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(studentName)) {
      setError('Please enter a valid name (letters and spaces only).');
      return;
    }
    setError('');

    try {
      playSuccess();
      const questions = await fetchQuestions();
      navigate('/quiz', { state: { studentName, questions } });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      navigate('/quiz', { state: { studentName, questions: [] } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-float">
          <h1 className="text-5xl font-bold text-primary-dark mb-4 flex items-center justify-center gap-4">
            <Brain className="w-12 h-12 text-accent-purple animate-wiggle" />
            Welcome to Quizzy!
          </h1>
          <p className="text-xl text-gray-600">The fun way to learn and grow! 🌟</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-pop">
          <div className="max-w-md mx-auto">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              What's your name, future genius? 🤔
            </label>
            <input
              type="text"
              placeholder="Enter your name here!"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-primary rounded-xl 
                focus:ring-2 focus:ring-primary focus:border-primary-light
                placeholder:text-gray-400"
            />
            {error && <p className="mt-2 text-secondary animate-bounce">{error}</p>}
            
            <button
              onClick={handleStartQuiz}
              className="w-full mt-6 bg-accent-blue hover:bg-blue-500 text-white 
                font-bold py-3 px-6 rounded-xl transform transition
                hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Rocket className="w-6 h-6" />
              Start Your Adventure!
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg transform transition hover:-translate-y-1">
            <Star className="w-10 h-10 text-accent-orange mb-4" />
            <h3 className="text-lg font-bold mb-2">Fun Challenges</h3>
            <p className="text-gray-600">Exciting questions that make learning an adventure!</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg transform transition hover:-translate-y-1">
            <Award className="w-10 h-10 text-accent-green mb-4" />
            <h3 className="text-lg font-bold mb-2">Win Badges</h3>
            <p className="text-gray-600">Collect awesome badges as you learn and grow!</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg transform transition hover:-translate-y-1">
            <Brain className="w-10 h-10 text-accent-purple mb-4" />
            <h3 className="text-lg font-bold mb-2">Learn & Grow</h3>
            <p className="text-gray-600">Watch your knowledge grow with each quiz!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
