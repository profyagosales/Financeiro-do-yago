import React from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
};
export default function MoneyInput({ value, onChange, placeholder }: Props) {
  const [raw, setRaw] = React.useState(
    (value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
  React.useEffect(() => {
    setRaw((value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [value]);

  const parseBRL = (s: string) => {
    const clean = s.replace(/\./g, "").replace(",", ".");
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  };

  return (
    <input
      className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
      inputMode="decimal"
      value={raw}
      placeholder={placeholder || "0,00"}
      onChange={(e) => {
        const v = e.target.value;
        setRaw(v);
        onChange(parseBRL(v));
      }}
      onBlur={() => {
        const n = parseBRL(raw);
        setRaw(n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }}
    />
  );
}