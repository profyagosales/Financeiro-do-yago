import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function WishlistCharts({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  if (!entries.length) return null;
  const colors = ["#10b981", "#0d9488", "#14b8a6", "#22d3ee", "#0ea5e9"];
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-medium">Categorias</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries.map(([name, value]) => ({ name, value }))}
              dataKey="value"
              innerRadius={30}
              outerRadius={50}
            >
              {entries.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

