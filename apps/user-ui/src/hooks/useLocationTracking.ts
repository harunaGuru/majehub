import { useState, useEffect } from 'react';
import axios from 'axios';
import { GeoData } from '@/store';

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = (): GeoData | null => {
  try {
    const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!storedLocation) {
      return null;
    }

    const locationData = JSON.parse(storedLocation);
    const currentTime = Date.now();
    const expiryTimeInMs = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // Check if location is expired
    if (currentTime - locationData.timestamp > expiryTimeInMs) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    // Return only the relevant fields
    return {
      city: locationData.city,
      country: locationData.country,
      lat: locationData.latitude,
      lon: locationData.longitude,
    };
  } catch (error) {
    return null;
  }
};

export const useGeoLocation = () => {
  const [geoData, setGeoData] = useState<GeoData | null>(getStoredLocation());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setGeoData(storedLocation);
      setLoading(false);
      return;
    }
    const fetchGeoData = async () => {
      try {
        setLoading(true);
        // const res = await axios.get('http://ip-api.com/json');
        // const newLocation = {
        //   city: res.data.city,
        //   country: res.data.country,
        //   lat: res.data.lat,
        //   lon: res.data.lon,
        //   timestamp: Date.now(),
        // };
        const res = await axios.get('https://ipwho.is');
        const newLocation = {
          city: res.data.city,
          country: res.data.country,
          lat: res.data.latitude,
          lon: res.data.longitude,
          timestamp: Date.now(),
        };
        setGeoData(newLocation);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
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
