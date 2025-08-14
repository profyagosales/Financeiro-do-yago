import { Progress } from "@/components/ui/progress";

export type ProgressItem = {
  label: string;
  value: number;
  total: number;
};

export default function ProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((i) => {
        const pct = i.total > 0 ? Math.round((i.value / i.total) * 100) : 0;
        return (
          <div key={i.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate">{i.label}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        );
      })}
    </div>
  );
}
