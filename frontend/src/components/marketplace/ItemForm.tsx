import { useEffect, useMemo, useRef, useState } from 'react'
import { MarketItem } from '../../features/marketplace/types'
import itemApi from '../../services/itemApi'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ui/ToastProvider'
import { formatApiErrors } from '../../utils/apiErrors'

type Props = {
  initial?: Partial<MarketItem>
  onSubmitSuccess?: (res: any) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export default function ItemForm({ initial = {}, onSubmitSuccess }: Props) {
  const isEdit = Boolean(initial?.id)
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [category, setCategory] = useState(initial.category?.slug || '')
  const [brand, setBrand] = useState(initial.brand || '')
  const [size, setSize] = useState(initial.size || '')
  const [condition, setCondition] = useState(initial.condition || 'good')
  const [status, setStatus] = useState(initial.status || 'available')
  const [location, setLocation] = useState(initial.location || '')
  const [tagsInput, setTagsInput] = useState((initial.tags || []).map((tag) => tag.name).join(', '))
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState(initial.images || [])
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const dropRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    itemApi.categories().then((d) => setCategories(d))
  }, [])

  useEffect(() => {
    if (!initial.id) return
    setTitle(initial.title || '')
    setDescription(initial.description || '')
    setCategory(initial.category?.slug || '')
    setBrand(initial.brand || '')
    setSize(initial.size || '')
    setCondition(initial.condition || 'good')
    setStatus(initial.status || 'available')
    setLocation(initial.location || '')
    setTagsInput((initial.tags || []).map((tag) => tag.name).join(', '))
    setExistingImages(initial.images || [])
    setRemovedImageIds([])
    setNewFiles([])
    setUploadProgress({})
  }, [initial])

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [newFiles])

  function validateFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type.'
    if (file.size > MAX_FILE_SIZE) return 'File too large.'
    return null
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const errorsList: string[] = []
    const valid = arr.filter((file) => {
      const error = validateFile(file)
      if (error) errorsList.push(`${file.name}: ${error}`)
      return !error
    })
    if (errorsList.length) {
      showToast({ message: errorsList.join(' '), variant: 'error' })
    }
    if (valid.length) {
      setNewFiles((current) => [...current, ...valid])
    }
  }

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return
    addFiles(event.target.files)
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (!event.dataTransfer.files) return
    addFiles(event.dataTransfer.files)
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function removeNewFile(index: number) {
    setNewFiles((current) => current.filter((_, i) => i !== index))
    setUploadProgress((progress) => {
      const next = { ...progress }
      delete next[String(index)]
      return next
    })
  }

  function removeExistingImage(id: number) {
    setExistingImages((current) => current.filter((img) => img.id !== id))
    setRemovedImageIds((current) => [...current, id])
  }

  const tagList = useMemo(() => parseTags(tagsInput), [tagsInput])

  async function uploadFiles(itemId: number) {
    for (const [index, file] of newFiles.entries()) {
      const form = new FormData()
      form.append('item', String(itemId))
      form.append('image', file)
      form.append('is_primary', String(existingImages.length === 0 && index === 0))
      await itemApi.images(form, (event) => {
        const percent = Math.round((event.loaded * 100) / (event.total || 1))
        setUploadProgress((current) => ({ ...current, [index]: percent, overall: percent }))
      })
    }
  }

  async function submit(event?: React.FormEvent) {
    event?.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const payload: any = {
        title,
        description,
        brand,
        size,
        condition,
        status,
        location,
        tags: tagList,
      }
      if (category) payload.category = category
      if (!tagList.length && isEdit) payload.tags = []

      let response: any
      if (isEdit && initial.id) {
        response = await itemApi.update(initial.id, payload)
        showToast({ message: 'Item updated. Uploading images...', variant: 'success' })
      } else {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        response = await itemApi.create(formData)
      }

      if (removedImageIds.length) {
        await Promise.all(removedImageIds.map((imageId) => itemApi.deleteImage(imageId)))
      }

      if (newFiles.length) {
        const itemId = isEdit && initial.id ? initial.id : response.id
        if (itemId) {
          await uploadFiles(itemId)
        }
      }

      showToast({ message: isEdit ? 'Item updated successfully.' : 'Item created successfully.', variant: 'success' })
      onSubmitSuccess?.(response)
      navigate('/dashboard/items')
    } catch (error: any) {
      const parsed = formatApiErrors(error)
      setErrors(parsed.fields || {})
      if (parsed.message) {
        showToast({ message: parsed.message, variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {errors.non_field_errors && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.non_field_errors.join(' ')}
        </div>
      )}
      <div>
        <label htmlFor="item-title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="item-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.join(' ')}</p>}
      </div>
      <div>
        <label htmlFor="item-description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="item-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={5}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.join(' ')}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="item-brand" className="block text-sm font-medium text-slate-700">
            Brand
          </label>
          <input
            id="item-brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="item-size" className="block text-sm font-medium text-slate-700">
            Size
          </label>
          <select
            id="item-size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="">Select</option>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="item-location" className="block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="item-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="item-condition" className="block text-sm font-medium text-slate-700">
            Condition
          </label>
          <select
            id="item-condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>
        <div>
          <label htmlFor="item-status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="item-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="item-category" className="block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="item-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          <option value="">Select</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="item-tags" className="block text-sm font-medium text-slate-700">
          Tags
        </label>
        <input
          id="item-tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="comma separated tags"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.join(' ')}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Images</label>
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`mt-1 rounded-xl border-2 p-4 transition ${isDragging ? 'border-brand-500 bg-brand-50/40' : 'border-dashed border-slate-300 bg-white'}`}
          aria-label="Drop images here"
        >
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <span>Drag and drop images, or click to browse.</span>
            <span>Supported: JPG, PNG, WEBP. Max 5MB per file.</span>
          </div>
          <input
            id="item-images"
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={onFiles}
            className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={img.image} alt={`Existing item image ${img.id}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-xs"
                  aria-label="Remove existing image"
                >
                  Remove
                </button>
              </div>
            ))}
            {previewUrls.map((preview, index) => (
              <div key={`${preview}-${index}`} className="relative h-28 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-xs"
                  aria-label="Remove uploaded preview"
                >
                  Remove
                </button>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: `${uploadProgress[String(index)] ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {uploadProgress.overall ? (
            <div className="mt-3 text-sm font-medium text-slate-700">
              Upload progress: {uploadProgress.overall}%
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Save Item'}
        </button>
      </div>
    </form>
  )
}
