import { useEffect, useState } from 'react'

type AsyncState<T> = {
  data: T | null
  error: string | null
  loading: boolean
}

export function useAsync<T>(asyncFunction: () => Promise<T>, dependencies: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true })

  useEffect(() => {
    let active = true
    setState({ data: null, error: null, loading: true })

    asyncFunction()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false })
      })
      .catch(() => {
        if (active) setState({ data: null, error: 'Unable to load data.', loading: false })
      })

    return () => {
      active = false
    }
  }, dependencies)

  return state
}
