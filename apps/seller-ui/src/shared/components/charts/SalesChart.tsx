'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import ChartHeader from './ChartHeader';
import { useEffect, useState } from 'react';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const SalesChart = () => {
  const [isMobile, setIsMobile] = useState(false);

  const series = [
    {
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100],
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const chartHeight = isMobile ? 240 : 320;

  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      // animations: {
      //   easing: 'easeinout',
      //   speed: 600,
      // },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: 'smooth',
      width: 3, // thinner looks cleaner on mobile
      colors: ['#2563eb'],
    },

    fill: {
      type: 'gradient',
      colors: ['#2563eb'],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },

    grid: {
      borderColor: 'rgba(255,255,255,0.08)',
      strokeDashArray: 4,
      padding: {
        left: 5,
        right: 5,
      },
    },

    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: {
          colors: '#9ca3af',
          fontSize: '11px',
        },
      },
    },

    yaxis: {
      show: false,
    },

    tooltip: {
      theme: 'dark',
      x: {
        show: true,
      },
    },

    legend: {
      show: false,
    },

    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 240,
          },
          stroke: {
            width: 2.5,
          },
          grid: {
            padding: {
              left: 0,
              right: 0,
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px',
              },
            },
          },
        },
      },
    ],
  };

  return (
    <div className="bg-black rounded-2xl p-4 sm:p-5 border border-[#111827] h-full overflow-hidden">
      <ChartHeader title="Revenue" subtitle="Last 6 months performance" />
      <Chart
        key="sales-chart"
        options={options}
        series={series}
        type="area"
        height={chartHeight}
      />
    </div>
  );
};

export default SalesChart;