import { useEffect, useState, useRef } from 'react'
import itemApi from '../../services/itemApi'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ui/ToastProvider'
import { formatApiErrors } from '../../utils/apiErrors'

type Props = {
  initial?: any
  onSubmitSuccess?: (res: any) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ItemForm({ initial = {}, onSubmitSuccess }: Props) {
  const isEdit = Boolean(initial?.id)
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [price, setPrice] = useState(initial.price ?? 0)
  const [category, setCategory] = useState(initial.category?.id || '')
  const [brand, setBrand] = useState(initial.brand || '')
  const [location, setLocation] = useState(initial.location || '')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<any[]>(initial.images || [])
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const navigate = useNavigate()
  const { showToast } = useToast()
  const dropRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    itemApi.categories().then((d) => setCategories(d))
  }, [])

  useEffect(() => {
    const urls = [...newFiles].map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  function validateFile(f: File) {
    if (!ALLOWED_TYPES.includes(f.type)) return 'Invalid file type.'
    if (f.size > MAX_FILE_SIZE) return 'File too large.'
    return null
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const errorsList: string[] = []
    const valid = arr.filter((f) => {
      const e = validateFile(f)
      if (e) errorsList.push(`${f.name}: ${e}`)
      return !e
    })
    if (errorsList.length) showToast({ message: errorsList.join(' '), variant: 'error' })
    setNewFiles((s) => [...s, ...valid])
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    addFiles(e.target.files)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    if (!e.dataTransfer.files) return
    addFiles(e.dataTransfer.files)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function removeNewFile(index: number) {
    setNewFiles((s) => s.filter((_, i) => i !== index))
  }

  function removeExistingImage(id: number) {
    setExistingImages((s) => s.filter((img) => img.id !== id))
    setRemovedImageIds((s) => [...s, id])
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const payload: any = { title, description, price, brand, location }
      if (category) payload.category = category
      // tags/metadata omitted for brevity

      let res: any
      if (isEdit && initial.id) {
        // optimistic: show success immediately
        res = await itemApi.update(initial.id, payload)
        showToast({ message: 'Item updated', variant: 'success' })
      } else {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)))
        newFiles.forEach((f) => fd.append('images', f))
        res = await itemApi.create(fd)
        showToast({ message: 'Item created', variant: 'success' })
      }

      // handle image deletions
      if (removedImageIds.length) {
        await Promise.all(removedImageIds.map((id) => itemApi.deleteImage(id)))
      }

      // upload new images for edit via images endpoint with progress
      if (isEdit && newFiles.length) {
        const form = new FormData()
        form.append('item', String(initial.id))
        newFiles.forEach((f) => form.append('image', f))
        await itemApi.images(form, (ev) => {
          const pct = Math.round((ev.loaded * 100) / (ev.total || 1))
          setUploadProgress({ overall: pct })
        })
      }

      onSubmitSuccess?.(res)
      navigate('/dashboard/items')
    } catch (err: any) {
      const parsed = formatApiErrors(err)
      setErrors(parsed.fields || {})
      if (parsed.message) showToast({ message: parsed.message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.join(' ')}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.join(' ')}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 w-full rounded-md border px-3 py-2" />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.join(' ')}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2">
          <option value="">Select</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Images</label>
        <div ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} className="mt-1 rounded-md border-dashed border-2 border-slate-200 p-3">
          <input type="file" multiple onChange={onFiles} className="mb-2" />
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative h-28 w-28 overflow-hidden rounded-md border">
                <img src={img.image} alt="existing" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-xs">Remove</button>
              </div>
            ))}
            {previewUrls.map((p, i) => (
              <div key={i} className="relative h-28 w-28 overflow-hidden rounded-md border">
                <img src={p} alt={`preview-${i}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeNewFile(i)} className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-xs">Remove</button>
              </div>
            ))}
          </div>
          {uploadProgress.overall && <div className="mt-2 text-sm">Upload: {uploadProgress.overall}%</div>}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand-600 px-4 py-2 text-white">
          {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Save Item'}
        </button>
      </div>
    </form>
  )
}
