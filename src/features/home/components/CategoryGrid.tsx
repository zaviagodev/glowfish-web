import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";
import { Category as ProductCategory } from "@/features/home/types/product.types";

type Category = Omit<
  ProductCategory,
  "store_name" | "created_at" | "updated_at"
>;

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
    <div className="flex items-center gap-3 px-[22px] overflow-auto pt-[21px] pb-4 scrollbar-hide">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => handleCategoryClick(null)}
          className="whitespace-nowrap px-3 py-2 h-9 text-black text-base active:shadow-[0px_0px_0px_4px_#FFFFFF40] outline outline-2 outline-background"
          style={{
            backgroundColor: "#F2E9D6",
            boxShadow: `0 0 0 4px ${
              selectedCategory === null ? "#F2E9D6" : "transparent"
            }`,
            transition: "box-shadow .1s",
          }}
        >
          {t("All")}
        </Button>
      </motion.div>
      {categories.map((category, index) => {
        const colors = ["#FADB28", "#317ABF", "#DE473C", "#F5853B", "#14A852"];
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
              className="whitespace-nowrap px-3 py-2 h-9 text-foreground text-base active:shadow-[0px_0px_0px_4px_#FFFFFF40] outline outline-2 outline-background"
              style={{
                backgroundColor: colors[index % colors.length],
                boxShadow: `0 0 0 4px ${
                  selectedCategory === category.id
                    ? colors[index % colors.length]
                    : "transparent"
                }`,
                transition: "box-shadow .1s",
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
