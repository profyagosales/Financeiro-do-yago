import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { usePeriod, type Mode } from "@/state/periodFilter";

const options: { value: Mode; label: string }[] = [
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
  { value: "custom", label: "Personalizado" },
];

export default function PeriodSelector() {
  const { mode, setMode } = usePeriod();
  return (
    <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
