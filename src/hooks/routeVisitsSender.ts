import { supabase } from '@/lib/supabaseClient';

type Visit = { path: string; ts: number; user_id?: string }

const BUFFER_KEY = 'routeVisits:buffer:v1'
const buffer: Visit[] = []
let timerId: number | null = null
const FLUSH_INTERVAL = 15 * 1000 // 15s
const FLUSH_BATCH = 100

function writeBuffer(b: Visit[]) {
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify(b))
  } catch {}
}

export function enqueueVisitSend(v: Visit) {
  buffer.push(v)
  if (buffer.length >= FLUSH_BATCH) void flushVisits()
  if (!timerId) {
    timerId = window.setTimeout(() => {
      void flushVisits()
    }, FLUSH_INTERVAL)
  }
  writeBuffer(buffer)
}

let flushInFlight = false
export async function flushVisits() {
  if (flushInFlight) return;
  flushInFlight = true;
  try {
    const toSend = buffer.splice(0, FLUSH_BATCH)
    writeBuffer(buffer)
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }

    if (toSend.length === 0) return

    try {
      // try Supabase insert if configured
      if (typeof supabase !== 'undefined') {
        const rows = toSend.map((t) => ({ path: t.path, ts: t.ts, user_id: t.user_id ?? null }))
        const { error } = await supabase.from('route_visits').insert(rows)
        if (error) throw error
        return
      }
    } catch (err) {
      // fallback to POST
    }

    try {
      await fetch('/api/route-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visits: toSend }),
      })
    } catch (err) {
      // last resort: requeue
      buffer.unshift(...toSend)
      writeBuffer(buffer)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[routeVisitsSender] flush erro', err);
    }
  } finally {
    flushInFlight = false;
  }
}

// inicialização opcional (placeholder para futura configuração de sender). Mantido para prevenir exceções em ambientes sem window.
try {
} catch (err) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[routeVisitsSender] init falhou', err);
  }
}

// Função de envio batched será implementada quando integração remota estiver pronta.
// async function sendBatch(batch: VisitRecord[]) {
//   try {
//     if (!batch.length) return;
//     // Placeholder envio (futuro: Supabase / fetch). Mantém batch para evitar unused.
//     // console.debug('[routeVisitsSender] enviando batch', batch.length);
//   } catch (err) {
//     if (process.env.NODE_ENV !== 'production') {
//       console.warn('[routeVisitsSender] sendBatch erro', err);
//     }
//   }
// }
