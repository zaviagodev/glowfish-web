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

const colors = [
  '#FADB28',
  '#317ABF',  
  '#DE473C',  
  '#F5853B',  
  '#14A852',
]

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

  const getCategoryColor = (index: number) => {
    return colors[index % colors.length];
  };
  
  const mainStyle = (cate: string | null) => {
    const isSelected = selectedCategory === cate;
    // const isNoStyle = tab_type === "no_style";
  
    return cn(
      "whitespace-nowrap px-3 py-2 h-9 text-base rounded-2xl border",
      {
        "!text-background":
          cate === null,
        "text-background font-bold":
          isSelected && cate === null,
        "text-foreground":
          cate,
        "text-foreground font-bold":
          isSelected,
      }
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-[22px] pt-[21px] pb-4 overflow-auto scrollbar-hide")}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => handleCategoryClick(null)}
          className={mainStyle(null)}
          style={{ 
            backgroundColor: '#F2E9D6',
            boxShadow: selectedCategory === null ? 
            `0 0 0 2px black,
            0 0 0 3px #F2E9D6
            ` : '',
          }}
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
              style={{ 
                backgroundColor: getCategoryColor(index),
                boxShadow: selectedCategory === category.id ? 
                `0 0 0 2px black,
                0 0 0 3px ${getCategoryColor(index)}
                ` : '',
              }}
            >
              {category.name}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
  
}
