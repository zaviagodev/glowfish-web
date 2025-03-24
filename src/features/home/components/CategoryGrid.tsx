import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";
import { Category as ProductCategory } from "@/features/home/types/product.types";
import CategoriesSkeletons from "@/components/skeletons/CategoriesSkeletons";
import { cn } from "@/lib/utils";

type Category = Omit<
  ProductCategory,
  "store_name" | "created_at" | "updated_at"
>;

type TabType = "colorful" | "no_style";

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  tab_type?: TabType;
}

export function CategoryGrid({
  categories,
  isLoading,
  selectedCategory,
  onSelectCategory,
  tab_type,
}: CategoryGridProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    navigate("/products", {
      state: { selectedCategory: categoryId },
    });
  };

  if (isLoading) {
    return <CategoriesSkeletons />;
  }

  const mainStyle = (cate: string | null) => {
    return cn(
      "whitespace-nowrap px-3 py-2 h-9 text-foreground text-base outline outline-1 outline-background !bg-transparent rounded-full border border-darkgray",
      {
        "!bg-foreground text-background border-foreground":
          selectedCategory === cate,
      },
      {
        "!bg-transparent rounded-none border-0 border-b-2 border-transparent text-muted-foreground":
          tab_type === "no_style",
      },
      {
        "border-b-white text-foreground":
          tab_type === "no_style" && selectedCategory === cate,
      }
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-[22px] pt-[21px] overflow-auto scrollbar-hide pb-0.5",
        { "pb-4": tab_type === "colorful" }
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => handleCategoryClick(null)}
          className={mainStyle(null)}
        >
          {t("All")}
        </Button>
      </motion.div>
      {categories.map((category, index) => {
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 + index * 0.1 }}
          >
            <Button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={mainStyle(category.id)}
            >
              {category.name}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
