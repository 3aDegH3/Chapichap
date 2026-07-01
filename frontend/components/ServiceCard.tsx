type Props = {
  title: string;
};

export default function ServiceCard({ title }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ color: "#666", marginTop: "8px" }}>
        سرویس حرفه‌ای و شخصی‌سازی شده
      </p>
    </div>
  );
}