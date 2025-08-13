/**
 * src/contexts/PeriodContext.tsx
 * Shim de compatibilidade: reexporta a implementação real do estado.
 * Assim, imports antigos de "@/contexts/PeriodContext" seguem funcionando
 * mesmo que a fonte oficial esteja em "@/state/periodFilter".
 */
export { PeriodProvider, usePeriod } from "@/state/periodFilter";
