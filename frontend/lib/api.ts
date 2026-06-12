const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/api/v1/health/`);

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
}