import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useTranslate } from "@refinedev/core";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryGrid({
  categories,
  isLoading,
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    navigate("/products", { state: { selectedCategory: categoryId } });
  };

  return (
    <div className="flex items-center gap-3 px-5 overflow-auto pt-[21px] pb-4 scrollbar-hide">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => handleCategoryClick(null)}
          variant={selectedCategory === null ? "default" : "secondary"}
          className={`px-3 py-2 h-7 ${
            selectedCategory === null ? "!bg-mainbutton" : "!bg-darkgray"
          }`}
        >
          {t("All")}
        </Button>
      </motion.div>
      {categories.map((category, index) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 + index * 0.1 }}
        >
          <Button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            variant={selectedCategory === category.id ? "default" : "secondary"}
            className={`whitespace-nowrap px-3 py-2 h-7 ${
              selectedCategory === category.id
                ? "!bg-mainbutton"
                : "!bg-darkgray"
            }`}
          >
            {category.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
