import { Skeleton } from "@/components/ui/skeleton";
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

type CategoryType = "events" | "products";

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  category_type: CategoryType;
}

export function CategoryGrid({
  categories,
  isLoading,
  selectedCategory,
  onSelectCategory,
  category_type,
}: CategoryGridProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    navigate(category_type === "events" ? "/events" : "/products", {
      state: { selectedCategory: categoryId },
    });
  };

  if (isLoading) {
    return <CategoriesSkeletons />;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-[22px] pt-[21px] overflow-auto scrollbar-hide pb-0.5",
        { "pb-4": category_type === "products" }
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "whitespace-nowrap px-3 py-2 h-9 text-black text-base outline outline-2 outline-background",
            {
              "!bg-transparent rounded-none border-b-2 border-transparent text-muted-foreground":
                category_type === "events",
            },
            {
              "border-b-white text-foreground":
                category_type === "events" && selectedCategory === null,
            }
          )}
          style={
            category_type === "products"
              ? {
                  backgroundColor: "#F2E9D6",
                  boxShadow: `0 0 0 4px ${
                    selectedCategory === null ? "#F2E9D6" : "transparent"
                  }`,
                  transition: "box-shadow .1s",
                }
              : {}
          }
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
              className={cn(
                "whitespace-nowrap px-3 py-2 h-9 text-foreground text-base outline outline-2 outline-background",
                {
                  "!bg-transparent rounded-none border-b-2 border-transparent text-muted-foreground":
                    category_type === "events",
                },
                {
                  "border-b-white text-foreground":
                    category_type === "events" &&
                    selectedCategory === category.id,
                }
              )}
              style={
                category_type === "products"
                  ? {
                      backgroundColor: colors[index % colors.length],
                      boxShadow: `0 0 0 4px ${
                        selectedCategory === category.id
                          ? colors[index % colors.length]
                          : "transparent"
                      }`,
                      transition: "box-shadow .1s",
                    }
                  : {}
              }
            >
              {category.name}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
