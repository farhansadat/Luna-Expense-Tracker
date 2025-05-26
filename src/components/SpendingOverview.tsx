import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#94a3b8', // text-dark-400
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: '#1e293b', // bg-dark-800
      titleColor: '#f8fafc', // text-dark-50
      bodyColor: '#cbd5e1', // text-dark-300
      borderColor: '#334155', // border-dark-700
      borderWidth: 1,
      padding: 12,
      bodyFont: {
        size: 12,
      },
      titleFont: {
        size: 14,
        weight: 'bold',
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#94a3b8', // text-dark-400
      },
    },
    y: {
      grid: {
        color: '#334155', // border-dark-700
        drawBorder: false,
      },
      ticks: {
        color: '#94a3b8', // text-dark-400
        callback: (value: number) => `$${value.toLocaleString()}`,
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
};

export default function SpendingOverview() {
  // Sample data - replace with real data from your state management
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [6500, 5900, 8000, 8100, 7600, 8250],
        borderColor: '#10B981', // text-accent-success
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [4800, 4200, 4600, 4300, 4100, 4320],
        borderColor: '#EF4444', // text-accent-danger
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-dark-100 text-lg font-semibold">Income vs Expenses</h3>
          <p className="text-dark-400 text-sm">Last 6 months overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-success"></div>
            <span className="text-dark-300 text-sm">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-danger"></div>
            <span className="text-dark-300 text-sm">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
} 