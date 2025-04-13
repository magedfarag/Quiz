import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any[];
  xAxis?: string;
  yAxis?: string;
  height?: number;
}

export const LineChart = ({ data, xAxis = 'date', yAxis = 'value', height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d[xAxis]),
    datasets: [{
      label: yAxis,
      data: data.map(d => d[yAxis]),
      borderColor: 'rgb(76, 201, 240)',
      backgroundColor: 'rgba(76, 201, 240, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export const BarChart = ({ data, xAxis = 'score', yAxis = 'count', height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => `${d[xAxis]}%`),
    datasets: [{
      label: yAxis,
      data: data.map(d => d[yAxis]),
      backgroundColor: 'rgba(76, 201, 240, 0.5)',
      borderColor: 'rgb(76, 201, 240)',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const DoughnutChart = ({ data, height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: [
        'rgba(76, 201, 240, 0.7)',
        'rgba(67, 97, 238, 0.7)',
        'rgba(123, 44, 191, 0.7)',
        'rgba(45, 198, 83, 0.7)',
        'rgba(255, 145, 77, 0.7)'
      ],
      borderColor: [
        'rgb(76, 201, 240)',
        'rgb(67, 97, 238)',
        'rgb(123, 44, 191)',
        'rgb(45, 198, 83)',
        'rgb(255, 145, 77)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
