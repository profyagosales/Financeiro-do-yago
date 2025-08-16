import { useEffect, useState } from 'react'

import { enqueueVisitSend } from './routeVisitsSender'

const STORAGE_KEY = 'routeVisits:v2'
const WINDOW_KEY = 'routeVisitsWindow'

type Store = Record<string, number[]> // path -> array of timestamps

function readStore(): Store {
  let visits: Store = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) visits = JSON.parse(raw) as Store;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useRouteVisits] parse visitas falhou', err);
    }
  }
  return visits
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new Event('routeVisitsChanged'))
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useRouteVisits] persist falhou', err)
    }
  }
}

export function incrementVisit(path: string) {
  if (!path) return
  const store = readStore()
  store[path] = store[path] || []
  const ts = Date.now()
  store[path].push(ts)
  // keep last 500 for safety
  if (store[path].length > 500) store[path] = store[path].slice(-500)
  writeStore(store)
  // enqueue for server-side analytics
  try {
    enqueueVisitSend({ path, ts })
  } catch {}
}

function countSince(arr: number[] | undefined, sinceMs: number) {
  if (!arr || arr.length === 0) return 0
  let i = arr.length - 1
  let c = 0
  while (i >= 0 && arr[i] >= sinceMs) {
    c++
    i--
  }
  return c
}

export function readWindowDays(): number {
  try {
    const raw = localStorage.getItem(WINDOW_KEY)
    if (!raw) return 30
    return Number(raw) || 30
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useRouteVisits] read window falhou', err)
    }
    return 30
  }
}

export function writeWindowDays(days: number) {
  try {
    localStorage.setItem(WINDOW_KEY, String(days))
    window.dispatchEvent(new Event('routeVisitsWindowChanged'))
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useRouteVisits] write window falhou', err)
    }
  }
}

export default function useRouteVisits(windowDays: number | null = null) {
  const [store, setStore] = useState<Store>(() => readStore())
  const [userWindow, setUserWindow] = useState<number>(() => windowDays ?? readWindowDays())

  useEffect(() => {
    const onChange = () => setStore(readStore())
    window.addEventListener('routeVisitsChanged', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('routeVisitsChanged', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const now = Date.now()
  const lastN = now - 1000 * 60 * 60 * 24 * userWindow

  const countsLastN: Record<string, number> = {}
  Object.entries(store).forEach(([k, arr]) => {
    countsLastN[k] = countSince(arr, lastN)
  })

  const totalVisits = Object.values(countsLastN).reduce((s, n) => s + (n || 0), 0)

  const top = Object.entries(countsLastN).sort((a, b) => b[1] - a[1])[0]
  const topRoute = top ? { path: top[0], count: top[1] } : null

  useEffect(() => {
    const onWindowChange = () => setUserWindow(readWindowDays())
    window.addEventListener('routeVisitsWindowChanged', onWindowChange)
    return () => window.removeEventListener('routeVisitsWindowChanged', onWindowChange)
  }, [])

  return { store, counts: countsLastN, countsLastN, incrementVisit, totalVisits, top: topRoute, userWindow, setUserWindow }
}

export function clearVisits() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('routeVisitsChanged'))
  } catch {}
}
