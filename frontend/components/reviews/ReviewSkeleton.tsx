export default function ReviewSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-52 animate-pulse rounded-2xl border border-[#E3DED5] bg-white" />
      ))}
    </div>
  );
}

