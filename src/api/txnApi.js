const BASE_URL = "http://localhost:8080/api/txnHistory";

export async function uploadCsv(userId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

export async function getMonthsTotal(userId) {
  const params = new URLSearchParams({ userId });
  const res = await fetch(`${BASE_URL}/monthsTotal?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// fetch all txns between two dates for a user
export async function getTransactionsBetweenDates(userId, startDate, endDate) {
  const params = new URLSearchParams({
    userId,
    startDate,
    endDate,
  });

  const res = await fetch(`${BASE_URL}/betweenDates?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // list of TxnHistory objects
}
