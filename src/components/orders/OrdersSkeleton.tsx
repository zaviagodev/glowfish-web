const OrdersSkeleton = () => {
  return (
    <div className="space-y-4 px-5">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-darkgray/50 rounded-lg overflow-hidden animate-pulse"
        >
          {/* Order Header Skeleton */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="h-4 w-24 bg-darkgray rounded"></div>
                <div className="h-3 w-32 bg-darkgray rounded mt-2"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-darkgray rounded-full"></div>
          </div>

          {/* Order Items Skeleton */}
          <div className="p-4 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-darkgray flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-darkgray rounded"></div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-darkgray rounded"></div>
                  <div className="h-4 w-20 bg-darkgray rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Footer Skeleton */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-darkgray rounded"></div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="h-3 w-12 bg-darkgray rounded mb-1"></div>
                  <div className="h-4 w-16 bg-darkgray rounded"></div>
                </div>
                <div className="h-5 w-5 bg-darkgray rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSkeleton;
