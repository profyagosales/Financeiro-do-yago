import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/financas/mes', () => {
    return HttpResponse.json({
      saldo: 12540.32,
      diff: 0.12,
      upcoming: [
        { id:'1', desc:'Cartão Nubank 10/08', color:'var(--clr-financas)' },
        { id:'2', desc:'Água', color:'#0EA5E9' },
        { id:'3', desc:'Internet', color:'#6366F1' },
        { id:'4', desc:'Aluguel', color:'#F97316' }
      ]
    });
  }),
  http.get('/api/invest/summary', () => {
    return HttpResponse.json({ total: 84500.22, dailyChange: -0.0065 });
  }),
  http.get('/api/milhas/expiring', () => {
    return HttpResponse.json({ expiringTotal: 18250, nextExpiryDate: '30/09/2025' });
  }),
  http.get('/api/metas/status', () => {
    const completed = 5; const total = 12;
    return HttpResponse.json({ completed, total, percent: (completed/total)*100 });
  }),
  http.get('/api/desejos/deals', () => {
    return HttpResponse.json({
      deals: [
        { id:'1', title:'Kindle em promoção' },
        { id:'2', title:'Monitor 27 144Hz' },
        { id:'3', title:'Fone ANC' },
        { id:'4', title:'Notebook upgrade' },
        { id:'5', title:'Teclado mecânico' }
      ]
    });
  }),
];
