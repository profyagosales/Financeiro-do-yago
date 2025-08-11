// src/components/BrandIcon.tsx
import { Icon } from "@iconify/react";
import {
  Wifi,
  Zap,
  Droplet,
  ShoppingCart,
  Car,
  Film,
  Home,
  Stethoscope,
  Smartphone,
  CreditCard,
  Landmark,
  ReceiptText,
} from "lucide-react";

/**
 * Componente de ícone de marca/categoria.
 * - Tenta usar logos oficiais (Iconify simple-icons).
 * - Se não achar, usa ícone de categoria com lucide-react.
 */
type BrandIconProps = {
  name: string;
  size?: number;
  className?: string;
};

const BRAND_MAP: Record<string, string> = {
  // Bancos / fintechs
  nubank: "simple-icons:nubank",
  itau: "simple-icons:itau",
  santander: "simple-icons:santander",
  bradesco: "simple-icons:bradesco",
  "banco do brasil": "simple-icons:bancodobrasil",
  bancodobrasil: "simple-icons:bancodobrasil",
  inter: "simple-icons:inter",
  xp: "simple-icons:xpinc",
  rico: "simple-icons:rico",
  clear: "simple-icons:clear",
  binance: "simple-icons:binance",
  coinbase: "simple-icons:coinbase",
  b3: "simple-icons:b3",

  // Empresas / serviços
  petrobras: "simple-icons:petrobras",
  mercadolivre: "simple-icons:mercadolibre",
  mercadolibre: "simple-icons:mercadolibre",
  uber: "simple-icons:uber",
  spotify: "simple-icons:spotify",
  netflix: "simple-icons:netflix",

  // Aéreas
  latam: "simple-icons:latamairlines",
  gol: "simple-icons:gol",
  azul: "simple-icons:azul",

  // Telecom (se não achar, cai no fallback por categoria)
  vivo: "simple-icons:vivo",
  tim: "simple-icons:telecomitalia", // aproxima TIM
  claro: "mdi:alpha-c-box", // aproxima CLARO
};

function pickBrandIconKey(s: string): string | undefined {
  // normaliza
  const n = s.toLowerCase();

  // tenta match direto por chaves do BRAND_MAP
  for (const key of Object.keys(BRAND_MAP)) {
    if (n.includes(key)) return BRAND_MAP[key];
  }

  // alguns apelidos úteis
  if (/\bpetr4|\bpetrobras/.test(n)) return BRAND_MAP["petrobras"];
  if (/\bbb\b|banco do brasil/.test(n)) return BRAND_MAP["banco do brasil"];

  return undefined;
}

function CategoryFallback({ label, size = 18 }: { label: string; size?: number }) {
  const n = label.toLowerCase();

  if (/(internet|wifi|fibra|net)/.test(n)) return <Wifi size={size} />;
  if (/(luz|energia|eletric)/.test(n)) return <Zap size={size} />;
  if (/(água|agua)/.test(n)) return <Droplet size={size} />;
  if (/(mercado|super|compra|carrefour|pão|pao)/.test(n)) return <ShoppingCart size={size} />;
  if (/(uber|99|corrida|mobilidade)/.test(n)) return <Car size={size} />;
  if (/(cinema|filme|netflix)/.test(n)) return <Film size={size} />;
  if (/(aluguel|alugue|moradia|imóvel|imovel|condomínio|condominio)/.test(n)) return <Home size={size} />;
  if (/(saúde|saude|méd|med|consulta|farm)/.test(n)) return <Stethoscope size={size} />;
  if (/(celular|telefone|tim|vivo|claro|oi)/.test(n)) return <Smartphone size={size} />;
  if (/(cartão|cartao|fatura|crédito|credito)/.test(n)) return <CreditCard size={size} />;
  if (/(invest|corretora|banco|itau|nubank|santander|bradesco)/.test(n)) return <Landmark size={size} />;

  return <ReceiptText size={size} />;
}

export default function BrandIcon({ name, size = 18, className = "" }: BrandIconProps) {
  const iconifyName = pickBrandIconKey(name);

  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full
        bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-indigo-400/15
        ring-1 ring-white/30 dark:ring-zinc-800/60 text-emerald-700 dark:text-emerald-300 ${className}`}
      title={name}
    >
      {iconifyName ? (
        <Icon icon={iconifyName} width={size} height={size} />
      ) : (
        <CategoryFallback label={name} size={size} />
      )}
    </span>
  );
}