export async function scanReceipt(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/receipt/scan', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to scan receipt');
  }

  return res.json();
}
