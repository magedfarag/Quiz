import React from 'react';
import { quizQuestions } from '../../data/quizData';

const AdminQuizManagement: React.FC = () => {
  return (
    <div className="admin-quiz-management">
      <h1 className="text-2xl font-bold">Quiz Management</h1>
      <table className="quiz-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {quizQuestions.map((question) => (
            <tr key={question.id}>
              <td>{question.id}</td>
              <td>{question.question}</td>
              <td>{question.options.join(', ')}</td>
              <td>{question.correctAnswer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminQuizManagement;
