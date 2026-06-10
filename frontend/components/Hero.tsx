export default function Hero() {
  return (
    <section className="container" style={{ marginTop: "40px" }}>
      <h1 style={{ fontSize: "42px", fontWeight: "bold" }}>
        هدیه‌ای بساز که خاص باشد
      </h1>

      <p style={{ marginTop: "12px", color: "#666" }}>
        چاپ اختصاصی روی ماگ، تیشرت و هدایای شخصی
      </p>

      <div style={{ marginTop: "20px" }}>
        <button className="btn">
          شروع سفارش
        </button>

        <button className="btn-outline" style={{ marginLeft: "10px" }}>
          مشاهده نمونه‌کارها
        </button>
      </div>
    </section>
  );
}