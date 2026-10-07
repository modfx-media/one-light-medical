import type { FieldHook } from 'payload'

/** Unique text fields must not store empty strings — they blank create forms. */
export const emptyToNull: FieldHook = ({ value }) => {
  if (value === '' || value === undefined) return null
  return value
}
