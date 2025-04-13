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

interface ChartData {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  xAxis?: string;
  yAxis?: string;
  height?: number;
}

export const LineChart = ({ data, xAxis = 'Date', yAxis = 'Value', height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: yAxis,
      data: data.map(d => d.value),
      borderColor: 'rgb(76, 201, 240)',
      tension: 0.1
    }]
  };

  return <Line data={chartData} height={height} options={{ responsive: true }} />;
};

export const BarChart = ({ data, xAxis = 'Category', yAxis = 'Value', height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: yAxis,
      data: data.map(d => d.value),
      backgroundColor: 'rgba(76, 201, 240, 0.5)',
      borderColor: 'rgb(76, 201, 240)',
      borderWidth: 1
    }]
  };

  return <Bar data={chartData} height={height} options={{ responsive: true }} />;
};

export const DoughnutChart = ({ data, height = 300 }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: [
        'rgba(76, 201, 240, 0.5)',
        'rgba(67, 97, 238, 0.5)',
        'rgba(123, 44, 191, 0.5)',
        'rgba(45, 198, 83, 0.5)',
        'rgba(255, 145, 77, 0.5)'
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

  return <Doughnut data={chartData} height={height} options={{ responsive: true }} />;
};
