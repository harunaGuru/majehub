import { useState, useEffect } from 'react';
import axios from 'axios';
import { GeoData } from '@/store';

export const useGeoLocation = () => {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://ip-api.com/json');
        setGeoData(res.data);
      } catch (err) {
        console.error('GeoLocation Error:', err);
        if (err instanceof Error) {
          setError(err);
        } else {
          // if it's not an Error, wrap it
          setError(new Error('Unknown error'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGeoData();
  }, []);

  return { geoData, loading, error };
};
