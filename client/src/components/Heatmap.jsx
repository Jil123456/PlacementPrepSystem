import React, { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import api from '../services/api';

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await api.get('/analytics/heatmap');
        if (response.data && response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
        setError('Failed to load activity graph');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Theme specifically for dark mode using the requested indigo theme
  const customTheme = {
    light: ['#ebedf0', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'],
    dark: ['#1e293b', '#3730a3', '#4f46e5', '#6366f1', '#818cf8'],
  };

  // Generate a full year of empty data to ensure the calendar looks complete
  const getFullYearData = () => {
    const yearData = [];
    const today = new Date();
    
    // Generate 365 days of history
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      yearData.push({
        date: date.toISOString().split('T')[0],
        count: 0,
        level: 0
      });
    }
    return yearData;
  };

  // Merge the API data with our full year template
  const fullYearData = getFullYearData();
  const displayData = fullYearData.map(day => {
    const existingDay = data.find(d => d.date === day.date);
    return existingDay || day;
  });

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
        <div className="h-32 w-full bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Activity Graph
      </h2>
      
      {error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : (
        <div className="flex justify-start md:justify-center w-full overflow-x-auto pb-2 custom-scrollbar">
          <div className="min-w-max">
            <ActivityCalendar
              data={displayData}
              theme={customTheme}
              colorScheme="dark"
              blockSize={15}
              blockRadius={4}
              blockMargin={5}
              fontSize={14}
              showWeekdayLabels={true}
              renderBlock={(block, activity) =>
                React.cloneElement(block, {
                  title: `${activity.count} questions solved on ${new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                })
              }
              labels={{
                totalCount: '{{count}} activities in the last year',
                legend: {
                  less: 'Less',
                  more: 'More',
                },
                months: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ],
                weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
