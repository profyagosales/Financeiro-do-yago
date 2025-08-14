import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import type { WishlistItem } from "./WishlistNewItemModal";

interface Props {
  item: WishlistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WishlistDrawer({ item, open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-80 bg-background p-4 shadow-xl overflow-auto">
          {item && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {item.imagem && (
                  <img src={item.imagem} alt="" className="h-16 w-16 object-cover rounded" />
                )}
                <div>
                  <h2 className="text-lg font-semibold leading-tight line-clamp-2">
                    {item.titulo}
                  </h2>
                  <p className="text-sm text-muted-foreground">{item.vendedor}</p>
                </div>
              </div>
              <div className="h-40">
                {item.historico && item.historico.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.historico} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                      <XAxis dataKey="data" hide />
                      <YAxis hide domain={['dataMin', 'dataMax']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="preco" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem histórico de preço.</p>
                )}
              </div>
              {item.notas && (
                <div>
                  <h3 className="font-medium">Notas</h3>
                  <p className="text-sm whitespace-pre-wrap">{item.notas}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium">Link</h3>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 hover:underline">
                  {item.link}
                </a>
              </div>
              {item.ofertas && item.ofertas.length > 0 && (
                <div>
                  <h3 className="font-medium">Ofertas comparadas</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {item.ofertas.map((o, idx) => (
                      <li key={idx}>
                        <a
                          href={o.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline"
                        >
                          {o.vendedor}: R$ {o.preco.toFixed(2)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

