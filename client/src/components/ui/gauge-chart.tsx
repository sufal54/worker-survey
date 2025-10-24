import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
  title: string;
  color?: string;
  className?: string;
}

export function GaugeChart({ 
  value, 
  max = 5, 
  title, 
  color = "#01B8AA",
  className = ""
}: GaugeChartProps) {
  const percentage = (value / max) * 100;
  const data = [
    { name: "value", value: percentage },
    { name: "empty", value: 100 - percentage }
  ];

  const getColor = (percentage: number) => {
    if (percentage >= 80) return "#22c55e";
    if (percentage >= 60) return "#01B8AA";
    if (percentage >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const fillColor = color || getColor(percentage);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="90%"
              dataKey="value"
              stroke="none"
            >
              <Cell fill={fillColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{value.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">out of {max}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium text-center text-foreground">{title}</div>
    </div>
  );
}
