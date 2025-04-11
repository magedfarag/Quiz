import React from 'react';

export const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-24 text-sm text-gray-600">{item.label}</div>
          <div className="flex-1">
            <div 
              className="bg-blue-500 h-6 rounded-md"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
          <div className="w-12 text-right text-sm font-medium">
            {item.value.toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
};

export const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  
  return (
    <div className="relative w-full h-64">
      {data.map((item, index) => {
        const percent = (item.value / total) * 100;
        const start = cumulativePercent;
        cumulativePercent += percent;
        
        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              clipPath: `conic-gradient(from ${start}%, #${Math.floor(Math.random()*16777215).toString(16)} ${percent}%)`
            }}
          ></div>
        );
      })}
    </div>
  );
};
