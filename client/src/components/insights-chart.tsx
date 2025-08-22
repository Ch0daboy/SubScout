import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InsightsChartProps {
  data: { title: string; count: number }[];
}

export default function InsightsChart({ data }: InsightsChartProps) {
  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title,
    fullName: item.title,
    mentions: item.count,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg" data-testid="chart-tooltip">
          <p className="font-medium text-gray-900 mb-1">{data.fullName}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-primary">{data.mentions}</span> mentions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64" data-testid="insights-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="mentions" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
