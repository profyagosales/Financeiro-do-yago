import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BRANDS, { type MilesProgram } from "@/components/miles/brandConfig";

interface MonthlyTotal {
  program: MilesProgram;
  total: number;
}

// Placeholder data; replace with real values later
const MOCK_MONTHLY_TOTALS: MonthlyTotal[] = [
  { program: "livelo", total: 1500 },
  { program: "latampass", total: 2300 },
  { program: "azul", total: 900 },
];

export default function MilesMonthlyTotals() {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">A receber no mês</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Programa</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MONTHLY_TOTALS.map((m) => (
                <tr key={m.program} className="border-t">
                  <td className="py-2">{BRANDS[m.program].label}</td>
                  <td className="py-2 text-right">{m.total.toLocaleString("pt-BR")} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
