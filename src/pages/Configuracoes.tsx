import { PushToggle } from '@/components/PushToggle';

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">⚙️ Configurações</h1>
      <section>
        <h2 className="text-lg font-semibold mb-2">Notificações</h2>
        <PushToggle />
      </section>
    </div>
  );
}
