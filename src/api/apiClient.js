// Base URL
const API_BASE = "http://localhost:8080";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    ...options,
    headers: options.body
      ? { ...defaultHeaders, ...(options.headers || {}) }
      : options.headers || {},
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data || res.statusText);
  }

  return data;
}

export { request, API_BASE };
