'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import ChartHeader from './ChartHeader';

const deviceData = [
  { name: 'Phone', value: 55 },
  { name: 'Tablet', value: 20 },
  { name: 'Computer', value: 25 },
];

const COLORS = ['#4ade80', '#facc15', '#60a5fa'];

const DevicePieChart = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-black rounded-2xl p-5 border border-[#111827] w-full h-full">
      <ChartHeader
        title="Device Usage"
        subtitle="How users access your platform"
      />

      <div className="w-full h-[320px] flex flex-col items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {deviceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Sales']}
                  contentStyle={{
                    backgroundColor: '#0A2544',
                    border: 'none',
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[80%] w-full flex items-center justify-center text-gray-500 text-sm">
            Loading...
          </div>
        )}

        <div className="flex items-center justify-center gap-5 flex-wrap mt-2">
          {deviceData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index],
                }}
              />

              <span className="text-gray-300 text-sm">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevicePieChart;