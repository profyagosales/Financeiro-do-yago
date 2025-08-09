export function Skeleton({ className='' }:{className?:string}) {
  return (
    <div className={`rounded-xl bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:800px_100%] animate-shimmer ${className}`} />
  );
}