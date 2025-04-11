import { jsPDF } from 'jspdf';
import { QuizResultData } from '../types';

export const generateQuizReport = (resultData: QuizResultData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add fancy border
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  
  // Draw decorative border
  doc.setDrawColor(76, 201, 240); // accent-blue
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  
  // Add inner border with different color
  doc.setDrawColor(123, 44, 191); // accent-purple
  doc.setLineWidth(0.3);
  doc.rect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3));

  // Add decorative corners
  const cornerSize = 15;
  doc.setLineWidth(0.5);
  doc.setDrawColor(45, 198, 83); // accent-green
  
  // Draw corners
  const drawCorners = () => {
    // Top left
    doc.line(margin, margin + cornerSize, margin, margin);
    doc.line(margin, margin, margin + cornerSize, margin);
    // Top right
    doc.line(pageWidth - margin - cornerSize, margin, pageWidth - margin, margin);
    doc.line(pageWidth - margin, margin, pageWidth - margin, margin + cornerSize);
    // Bottom left
    doc.line(margin, pageHeight - margin - cornerSize, margin, pageHeight - margin);
    doc.line(margin, pageHeight - margin, margin + cornerSize, pageHeight - margin);
    // Bottom right
    doc.line(pageWidth - margin - cornerSize, pageHeight - margin, pageWidth - margin, pageHeight - margin);
    doc.line(pageWidth - margin, pageHeight - margin - cornerSize, pageWidth - margin, pageHeight - margin);
  };
  drawCorners();

  // Add certificate header
  doc.setFontSize(40);
  doc.setTextColor(76, 201, 240); // accent-blue
  doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' });

  // Add decorative line under header
  doc.setLineWidth(0.5);
  doc.setDrawColor(255, 145, 77); // accent-orange
  doc.line(pageWidth / 4, 45, (pageWidth * 3) / 4, 45);

  // Add congratulatory text
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('This certificate is proudly presented to:', pageWidth / 2, 60, { align: 'center' });

  // Add student name - escape special characters
  doc.setFontSize(30);
  doc.setTextColor(123, 44, 191); // accent-purple
  const sanitizedName = decodeURIComponent(encodeURIComponent(resultData.studentName))
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
  doc.text(sanitizedName, pageWidth / 2, 75, { align: 'center' });

  // Add achievement details
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('for successfully completing the quiz with a score of', pageWidth / 2, 90, { align: 'center' });

  // Add score
  const percentage = (resultData.score / resultData.totalQuestions * 100).toFixed(1);
  doc.setFontSize(24);
  doc.setTextColor(45, 198, 83); // accent-green
  doc.text(`${resultData.score}/${resultData.totalQuestions} (${percentage}%)`, pageWidth / 2, 105, { align: 'center' });

  // Add date
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Awarded on ${new Date(resultData.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, pageWidth / 2, 125, { align: 'center' });

  // Add decorative symbols using safe characters
  doc.setFontSize(24);
  doc.setTextColor(255, 145, 77); // accent-orange
  doc.text('*', pageWidth / 2 - 50, pageHeight - 40, { align: 'center' });
  doc.text('+', pageWidth / 2, pageHeight - 40, { align: 'center' });
  doc.text('*', pageWidth / 2 + 50, pageHeight - 40, { align: 'center' });

  // Add validation text
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This certificate validates the successful completion of the Quizzy assessment.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  return doc.output('datauristring');
};

export const fetchReports = async () => {
  return [
    { id: 1, name: 'Report 1', date: '2025-04-10' },
    { id: 2, name: 'Report 2', date: '2025-04-09' }
  ];
};
