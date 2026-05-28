import { useState, useEffect } from 'react'

export function useImagePreview(file?: File) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    return () => {
      // nothing to cleanup for FileReader
    }
  }, [file])

  return preview
}
