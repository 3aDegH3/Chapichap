
# 🟦 Project Setup

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
````

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API

```
GET /api/v1/health/
```

---

## Env

* backend: `.env`
* frontend: `.env.local`

````

---

# 🟢 TASK 4.4 — Error Handling Basic

## 📍 frontend/lib/api.ts

آپدیت بهتر:

```ts
export async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/health/`);

    if (!res.ok) {
      return { status: "error" };
    }

    return await res.json();
  } catch (err) {
    return { status: "network_error" };
  }
}
````

