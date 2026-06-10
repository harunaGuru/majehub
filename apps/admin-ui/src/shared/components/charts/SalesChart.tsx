'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import ChartHeader from './ChartHeader';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const SalesChart = () => {
  const series = [
    {
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 4,
      colors: ['#2563eb'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.15,
        opacityTo: 0.5,
        stops: [0, 100],
      },
      colors: ['#2563eb'],
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.08)',
      strokeDashArray: 5,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: { style: { colors: '#9ca3af', fontSize: '12px' } },
    },
    yaxis: { show: false },
    tooltip: { theme: 'dark' },
    legend: { show: false },
  };

  return (
    <div className="bg-black rounded-2xl p-5 border border-[#111827] h-full">
      <ChartHeader title="Revenue" subtitle="Last 6 months performance" />

      <Chart
        key="sales-chart"
        options={options}
        series={series}
        type="area"
        height={320}
      />
    </div>
  );
};

export default SalesChart;