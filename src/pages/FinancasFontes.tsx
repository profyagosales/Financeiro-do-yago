import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { useCreditCards, type CreditCard } from "@/hooks/useCreditCards";
import BrandIcon from "@/components/BrandIcon";
import { supabase } from "@/lib/supabaseClient";

export default function FinancasFontes() {
  const {
    data: accounts,
    create: addAccount,
    update: updateAccount,
  } = useAccounts();
  const { data: cards, create: addCard } = useCreditCards();

  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "conta",
    institution: "",
    balance: 0,
  });

  const [cardForm, setCardForm] = useState({
    name: "",
    brand: "",
    limit_value: 0,
    closing_day: 1,
    due_day: 1,
    account_id: "",
  });

  const [transfer, setTransfer] = useState({ from: "", to: "", amount: 0 });

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAccount(accountForm);
    setAccountForm({ name: "", type: "conta", institution: "", balance: 0 });
  };

  const submitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCard(cardForm);
    setCardForm({
      name: "",
      brand: "",
      limit_value: 0,
      closing_day: 1,
      due_day: 1,
      account_id: "",
    });
  };

  const handleAdjust = async (acc: Account) => {
    const val = prompt("Novo saldo", String(acc.balance));
    if (!val) return;
    const newBalance = parseFloat(val);
    if (Number.isNaN(newBalance)) return;
    const diff = newBalance - acc.balance;
    if (diff === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("transactions").insert({
      date: today,
      description: "Ajuste de saldo",
      amount: diff,
      type: diff > 0 ? "income" : "expense",
      source_type: "account",
      source_id: acc.id,
    });
    await updateAccount(acc.id, { balance: newBalance });
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transfer.amount);
    if (!transfer.from || !transfer.to || transfer.from === transfer.to || amount <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("transactions").insert([
      {
        date: today,
        description: `Transferência para ${accounts.find(a => a.id === transfer.to)?.name ?? ""}`,
        amount: -amount,
        type: "transfer",
        source_type: "account",
        source_id: transfer.from,
      },
      {
        date: today,
        description: `Transferência de ${accounts.find(a => a.id === transfer.from)?.name ?? ""}`,
        amount: amount,
        type: "transfer",
        source_type: "account",
        source_id: transfer.to,
      },
    ]);
    await updateAccount(
      transfer.from,
      { balance: (accounts.find(a => a.id === transfer.from)?.balance || 0) - amount }
    );
    await updateAccount(
      transfer.to,
      { balance: (accounts.find(a => a.id === transfer.to)?.balance || 0) + amount }
    );
    setTransfer({ from: "", to: "", amount: 0 });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fontes" subtitle="Gerencie contas e cartões" />
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="cards">Cartões</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-2 font-semibold">Minhas Contas</h2>
              <ul className="space-y-2">
                {accounts.map((acc) => (
                  <li key={acc.id} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <div className="font-medium">{acc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Saldo: {acc.balance}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handleAdjust(acc)}>
                      Ajustar
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Nova Conta</h2>
              <form onSubmit={submitAccount} className="grid gap-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input value={accountForm.type} onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })} />
                </div>
                <div>
                  <Label>Instituição</Label>
                  <Input
                    value={accountForm.institution}
                    onChange={(e) => setAccountForm({ ...accountForm, institution: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Saldo inicial</Label>
                  <Input
                    type="number"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: parseFloat(e.target.value) })}
                  />
                </div>
                <Button type="submit">Adicionar</Button>
              </form>
              <div className="mt-6">
                <h3 className="mb-2 font-semibold">Transferência</h3>
                <form onSubmit={handleTransfer} className="grid gap-2">
                  <div>
                    <Label>De</Label>
                    <select
                      className="w-full rounded-md border p-2"
                      value={transfer.from}
                      onChange={(e) => setTransfer({ ...transfer, from: e.target.value })}
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Para</Label>
                    <select
                      className="w-full rounded-md border p-2"
                      value={transfer.to}
                      onChange={(e) => setTransfer({ ...transfer, to: e.target.value })}
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={transfer.amount}
                      onChange={(e) => setTransfer({ ...transfer, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button type="submit">Transferir</Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="cards">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-2 font-semibold">Meus Cartões</h2>
              <ul className="space-y-2">
                {cards.map((card) => (
                  <li key={card.id} className="flex items-center justify-between rounded border p-2">
                    <div className="flex items-center gap-2">
                      {card.brand && <BrandIcon name={card.brand} />}
                      <div>
                        <div className="font-medium">{card.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Limite: {card.limit_value}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Novo Cartão</h2>
              <form onSubmit={submitCard} className="grid gap-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} />
                </div>
                <div>
                  <Label>Banco/Instituição</Label>
                  <Input value={cardForm.brand} onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value })} />
                </div>
                <div>
                  <Label>Limite</Label>
                  <Input
                    type="number"
                    value={cardForm.limit_value}
                    onChange={(e) => setCardForm({ ...cardForm, limit_value: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Fechamento</Label>
                    <Input
                      type="number"
                      value={cardForm.closing_day}
                      onChange={(e) => setCardForm({ ...cardForm, closing_day: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input
                      type="number"
                      value={cardForm.due_day}
                      onChange={(e) => setCardForm({ ...cardForm, due_day: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Conta de pagamento</Label>
                  <select
                    className="w-full rounded-md border p-2"
                    value={cardForm.account_id}
                    onChange={(e) => setCardForm({ ...cardForm, account_id: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit">Adicionar</Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

