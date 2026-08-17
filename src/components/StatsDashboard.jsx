import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { mockReviews } from '../services/mockData';

const COLORS = ['#5865F2', '#EB459E', '#FEE75C', '#57F287', '#ED4245', '#FFFFFF'];

const StatsDashboard = ({ username }) => {
  // 1. Filter data based on username
  const userReviews = useMemo(() => {
    if (username === 'all') return mockReviews;
    return mockReviews.filter(r => r.username.toLowerCase() === username.toLowerCase());
  }, [username]);

  // 2. Calculate average rating
  const avgRating = useMemo(() => {
    if (userReviews.length === 0) return 0;
    const sum = userReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / userReviews.length).toFixed(1);
  }, [userReviews]);

  // 3. Category distribution for PieChart
  const categoryData = useMemo(() => {
    const counts = {};
    userReviews.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [userReviews]);

  if (userReviews.length === 0) {
    return (
      <div className="embed" style={{ backgroundColor: '#1e1f22', borderLeftColor: '#ED4245' }}>
        <div className="embed-title" style={{ color: '#ED4245' }}>결과 없음</div>
        <div className="embed-description">'{username}' 님의 리뷰 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="embed" style={{ backgroundColor: '#2b2d31', maxWidth: '800px' }}>
      <div className="embed-author">
        <span style={{ fontSize: '18px' }}>📊 {username === 'all' ? '전체 사용자' : `${username} 님`}의 통계 대시보드</span>
      </div>
      
      <div className="embed-fields" style={{ marginBottom: '16px' }}>
        <div className="embed-field">
          <span className="embed-field-name">총 리뷰 수</span>
          <span className="embed-field-value" style={{ fontSize: '24px', fontWeight: 'bold' }}>{userReviews.length}개</span>
        </div>
        <div className="embed-field">
          <span className="embed-field-name">평균 평점</span>
          <span className="embed-field-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#FEE75C' }}>
            ⭐ {avgRating}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Pie Chart */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1e1f22', padding: '16px', borderRadius: '8px' }}>
          <div className="embed-field-name" style={{ textAlign: 'center', marginBottom: '8px' }}>카테고리 분포</div>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1f22', border: 'none', borderRadius: '4px', color: '#dbdee1' }} 
                  itemStyle={{ color: '#dbdee1' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart (Optional extra chart: reviews per category as bars) */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1e1f22', padding: '16px', borderRadius: '8px' }}>
           <div className="embed-field-name" style={{ textAlign: 'center', marginBottom: '8px' }}>카테고리별 리뷰 수</div>
           <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#383a40" />
                <XAxis dataKey="name" stroke="#dbdee1" tick={{ fill: '#949ba4', fontSize: 12 }} />
                <YAxis stroke="#dbdee1" tick={{ fill: '#949ba4', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#313338', border: 'none', borderRadius: '4px', color: '#dbdee1' }} 
                />
                <Bar dataKey="value" fill="#5865F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
