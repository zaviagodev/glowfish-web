import { SVGSkeleton } from "../ui/skeleton";
import CategoriesSkeletons from "./CategoriesSkeletons";
import ProductCardSkeleton from "./ProductCardSkeletons";

const HomeSkeletons = () => {
  return (
    <div className="min-h-screen relative p-5">
      <div className="flex items-center justify-between">
        <SVGSkeleton className="w-12 h-12 bg-darkgray rounded-full" />
        <SVGSkeleton className="w-12 h-12 bg-darkgray rounded-full" />
      </div>
      <div className="-mx-5 border-b">
        <CategoriesSkeletons />
      </div>
      <div className="py-6 space-y-6 px-[1px]">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
};

export default HomeSkeletons;
