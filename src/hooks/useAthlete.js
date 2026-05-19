import { useState, useEffect } from 'react';
import { fetchAthlete, getTokens } from '../lib/strava';

export function useAthlete() {
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens) return;
    fetchAthlete()
      .then(setAthlete)
      .catch(() => {});
  }, []);

  return { athlete };
}
