export async function getVitals(kind) {
  const res = await fetch(`/api/vitals?type=${kind}`, { headers: { Accept: 'application/json' } });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = await res.text(); // log HTML/error for debugging
    throw new Error(`Request failed ${res.status}: ${text.slice(0,200)}`);
  }
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON but got: ${contentType}. First bytes: ${text.slice(0,120)}`);
  }
  return res.json();
}
