export function cleanObject<T extends Record<string, any>>(
  obj?: T
): Partial<T> {
  if (!obj) return {}

  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  ) as Partial<T>
}

/*
purpose: removed empty fields from an object

Sample use
await api.get(ENDPOINTS.fees, {
  student_id: studentId,
  ...cleanObject(params),
  ...cleanObject(params.filters),
})
*/ 