// hooks/useLocation.ts
import * as Location from 'expo-location';
import { useState } from 'react';

export default function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentAddress = async (): Promise<string | null> => {
    setError(null);
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission denied');
        return null;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const [placemark] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const { city, region, street, name } = placemark;
      // Build a simple address string:
      return [name, street, city, region].filter(Boolean).join(', ');
    } catch (e) {
      console.error(e);
      setError('Unable to fetch location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getCurrentAddress, loading, error };
}
