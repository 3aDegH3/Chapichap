import ServiceCard from "./ServiceCard";

export default function Services() {
  return (
    <section className="container" style={{ marginTop: "60px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        خدمات ما
      </h2>

      <div style={{ display: "flex", gap: "16px" }}>
        <ServiceCard title="چاپ روی ماگ" />
        <ServiceCard title="چاپ روی تیشرت" />
        <ServiceCard title="هدایای اختصاصی" />
      </div>
    </section>
  );
}  