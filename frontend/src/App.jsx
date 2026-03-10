import { useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import './index.css';

const API = '/api';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API}/insights/refresh`);
      setLastUpdated(res.data.fetched_at);
      setRefreshTrigger(t => t + 1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Navbar
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
        />
        <Dashboard key={refreshTrigger} onDateChange={setDateRange} />
      </div>
      <div style={{
        textAlign: 'center', marginTop: 48, paddingBottom: 24,
        color: 'rgba(100,116,139,0.6)', fontSize: 12
      }}>
        InsightBoard · Facebook Ads Dashboard · Built with React + FastAPI + MongoDB
      </div>
    </div>
  );
}