import { useEffect, useState } from 'react'

type Value<T> = T | (() => T)

export function useLocalStorage<T>(key: string, initialValue: Value<T>) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
    } catch {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // ignore storage errors
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
