'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import ChartHeader from '../charts/ChartHeader';

const geoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const countryData = [
  { name: 'United States of America', users: 120, sellers: 30 },
  { name: 'India', users: 100, sellers: 20 },
  { name: 'United Kingdom', users: 85, sellers: 15 },
  { name: 'Germany', users: 70, sellers: 10 },
  { name: 'Canada', users: 60, sellers: 5 },
  { name: 'Nigeria', users: 130, sellers: 35 },
];

const DistributionMap = () => {
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
  });

  const [hovered, setHovered] = useState<{
    name: string;
    users: number;
    sellers: number;
  } | null>(null);

  const getCountryData = (name: string) => {
    return countryData.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase()
    );
  };

  const getColor = (geoName: string) => {
    const country = getCountryData(geoName);

    if (!country) return '#111827';

    if (country.users + country.sellers > 100) {
      return '#22c55e';
    }

    if (country.users + country.sellers > 0) {
      return '#2563eb';
    }

    return '#111827';
  };

  return (
    <div className="bg-black rounded-2xl border border-[#111827] p-5 relative overflow-hidden">
      <ChartHeader
        title="User & Seller Distribution"
        subtitle="Visual breakdown of global user & seller activity."
      />

      <div className="relative mt-5">
        <ComposableMap
          projection="geoEqualEarth"
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName =
                  geo.properties.name || '';

                const data =
                  getCountryData(geoName);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      if (!data) return;

                      setHovered({
                        name: data.name,
                        users: data.users,
                        sellers: data.sellers,
                      });

                      setTooltipPosition({
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPosition({
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                    }}
                    style={{
                      default: {
                        fill: getColor(geoName),
                        outline: 'none',
                      },
                      hover: {
                        fill: '#3b82f6',
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#3b82f6',
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                duration: 0.2,
              }}
              className="fixed z-50 bg-[#0A0F1C] border border-[#1f2937] rounded-xl p-3 pointer-events-none"
              style={{
                top: tooltipPosition.y + 10,
                left: tooltipPosition.x + 10,
              }}
            >
              <strong className="text-white text-sm block">
                {hovered.name}
              </strong>

              <p className="text-green-400 text-xs mt-1">
                Users: {hovered.users}
              </p>

              <p className="text-yellow-400 text-xs">
                Sellers: {hovered.sellers}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DistributionMap;