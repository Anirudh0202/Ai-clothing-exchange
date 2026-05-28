export function formatApiErrors(err: any) {
  const out: { message?: string; fields?: Record<string, string[]> } = {}
  if (!err) return out
  const resp = err.response
  if (!resp) {
    out.message = err.message || 'Network error'
    return out
  }
  const data = resp.data
  if (!data) {
    out.message = resp.statusText || 'Error'
    return out
  }
  // DRF validation format: { field: ['err1'], non_field_errors: ['...'] }
  const fields: Record<string, string[]> = {}
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) fields[key] = data[key].map(String)
  }
  out.fields = fields
  if (data.detail) out.message = String(data.detail)
  if (!out.message && fields.non_field_errors) out.message = fields.non_field_errors.join(' ')
  return out
}
