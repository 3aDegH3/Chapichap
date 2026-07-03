export default function CartSkeleton() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-5 rounded-[30px] border border-[#E3DBD0] bg-white p-5 sm:grid-cols-[180px_minmax(0,1fr)]"
        >
          <div className="aspect-[4/3] animate-pulse rounded-[24px] bg-[#E9E2D9]" />

          <div>
            <div className="h-9 w-3/4 animate-pulse rounded-full bg-[#E9E2D9]" />
            <div className="mt-4 h-7 w-1/2 animate-pulse rounded-full bg-[#EFE9E1]" />

            <div className="mt-6 flex gap-3">
              <div className="h-11 w-32 animate-pulse rounded-full bg-[#EFE9E1]" />
              <div className="h-11 w-28 animate-pulse rounded-full bg-[#EFE9E1]" />
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[#EEE7DE] pt-5">
              <div className="h-14 w-48 animate-pulse rounded-[18px] bg-[#E9E2D9]" />
              <div className="h-10 w-36 animate-pulse rounded-full bg-[#E9E2D9]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}