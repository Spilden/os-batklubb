export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p className="rounded-lg p-3 bg-red-100 border border-red-500 text-red-700 text-sm">{error}</p>
    )
  }
  if (message) {
    return (
      <p className="rounded-lg p-3 bg-green-100 border border-green-500 text-green-700 text-sm">
        {message}
      </p>
    )
  }
  return null
}
