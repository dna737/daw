export default function DogCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
      {/* Image skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="flex flex-col gap-2">
        {/* Name skeleton */}
        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
        
        {/* Breed skeleton */}
        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
        
        {/* Like button skeleton */}
        <div className="mt-2 h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  )
} 