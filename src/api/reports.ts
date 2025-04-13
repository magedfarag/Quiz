import { jsPDF } from 'jspdf';
import { QuizResultData } from '../types';

export const generateQuizReport = (resultData: QuizResultData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const cornerSize = 20;
  
  // Add gradient background
  const addGradientBackground = () => {
    doc.setFillColor(240, 249, 255); // light blue
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add subtle pattern
    for (let i = 0; i < pageWidth; i += 20) {
      for (let j = 0; j < pageHeight; j += 20) {
        doc.setFillColor(245, 251, 255);
        doc.circle(i, j, 0.5, 'F');
      }
    }
  };
  addGradientBackground();

  // Draw decorative corners
  const drawCorners = () => {
    doc.setDrawColor(76, 201, 240); // accent-blue
    doc.setLineWidth(0.5);
    
    // Top left
    doc.line(margin, margin, margin + cornerSize, margin);
    doc.line(margin, margin, margin, margin + cornerSize);
    
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

  // Add certificate header with modern typography
  doc.setFontSize(42);
  doc.setTextColor(76, 201, 240); // accent-blue
  doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' });

  // Add decorative lines under header
  const addDecorativeLines = () => {
    doc.setLineWidth(0.3);
    doc.setDrawColor(255, 145, 77); // accent-orange
    doc.line(pageWidth / 4, 45, (pageWidth * 3) / 4, 45);
    doc.setDrawColor(123, 44, 191); // accent-purple
    doc.line(pageWidth / 4 + 10, 47, (pageWidth * 3) / 4 - 10, 47);
  };
  addDecorativeLines();

  // Add congratulatory text with improved styling
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('This certificate is proudly presented to:', pageWidth / 2, 60, { align: 'center' });

  // Add student name with special formatting
  doc.setFontSize(32);
  doc.setTextColor(123, 44, 191); // accent-purple
  const sanitizedName = decodeURIComponent(encodeURIComponent(resultData.studentName))
    .replace(/[^\x20-\x7E]/g, '');
  doc.text(sanitizedName, pageWidth / 2, 75, { align: 'center' });

  // Add achievement details with styled sections
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('for successfully completing the quiz with an outstanding score of', pageWidth / 2, 90, { align: 'center' });

  // Add score with dynamic color based on performance
  const percentage = (resultData.score / resultData.totalQuestions * 100).toFixed(1);
  doc.setFontSize(28);
  const scoreColor = percentage >= 90 ? [45, 198, 83] : percentage >= 70 ? [76, 201, 240] : [255, 145, 77];
  doc.setTextColor(...scoreColor);
  doc.text(`${resultData.score}/${resultData.totalQuestions} (${percentage}%)`, pageWidth / 2, 105, { align: 'center' });

  // Add date with modern formatting
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  const formattedDate = new Date(resultData.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Awarded on ${formattedDate}`, pageWidth / 2, 125, { align: 'center' });

  // Add decorative elements
  const addDecorations = () => {
    doc.setFontSize(24);
    doc.setTextColor(255, 145, 77); // accent-orange
    const symbols = ['★', '✦', '✶', '✹', '✵'];
    symbols.forEach((symbol, index) => {
      const x = (pageWidth / 6) * (index + 1);
      doc.text(symbol, x, pageHeight - 30, { align: 'center' });
    });
  };
  addDecorations();

  // Add validation text and QR code placeholder
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This certificate validates the successful completion of the Quizzy assessment.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Add small logo or watermark
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text('Quizzy™', pageWidth - margin - 10, pageHeight - margin - 5, { align: 'right' });

  return doc.output('datauristring');
};

export const fetchReports = async () => {
  return [
    { id: 1, name: 'Report 1', date: '2025-04-10' },
    { id: 2, name: 'Report 2', date: '2025-04-09' }
  ];
};
