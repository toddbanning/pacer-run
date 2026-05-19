import { useState, useEffect, useCallback } from 'react';
import { fetchAllActivitiesSince, getTokens } from '../lib/strava';
import { fetchTrainingPlan, fetchRaces, fetchShoes, fetchSettings } from '../lib/sheets';

export function useStravaData(daysBack = 120) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllActivitiesSince(daysBack);
      setActivities(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    const tokens = getTokens();
    if (tokens) load();
    else setLoading(false);
  }, [load]);

  return { activities, loading, error, refetch: load };
}

export function useSheetsData() {
  const [plan, setPlan] = useState([]);
  const [races, setRaces] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
    if (!apiKey) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchTrainingPlan(),
      fetchRaces(),
      fetchShoes(),
      fetchSettings(),
    ]).then(([p, r, s, st]) => {
      setPlan(p);
      setRaces(r);
      setShoes(s);
      setSettings(st);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { plan, races, shoes, settings, loading, error };
}
