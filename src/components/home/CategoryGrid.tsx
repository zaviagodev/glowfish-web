import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useTranslate } from "@refinedev/core";
import { useState } from "react";

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
          className="whitespace-nowrap px-3 py-2 h-9 text-white text-base active:shadow-[0px_0px_0px_4px_#FFFFFF40]"
          style={{
            backgroundColor: "#DE473C",
            boxShadow: `0px 0px 0px 3px ${
              selectedCategory === null ? "#EAC4C3" : "transparent"
            }`,
          }}
        >
          {t("All")}
        </Button>
      </motion.div>
      {categories.map((category, index) => {
        const colors = ["#DE473C", "#F5853B", "#FADB28", "#14A852", "#317ABF"];
        const activeColors = [
          "#EAC4C3",
          "#F2D1AA",
          "#FBF5D9",
          "#8DD69D",
          "#90BBE1",
        ];
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
              className="whitespace-nowrap px-3 py-2 h-9 text-white text-base active:shadow-[0px_0px_0px_4px_#FFFFFF40]"
              style={{
                backgroundColor: colors[(index + 1) % colors.length],
                boxShadow: `0px 0px 0px 3px ${
                  selectedCategory === category.id
                    ? activeColors[(index + 1) % colors.length]
                    : "transparent"
                }`,
              }}
            >
              {category.name}
            </Button>
          </motion.div>
        );
      })}

      {/* {mockCategories.map((category, index) => {
        const colors = ["#DE473C", "#F5853B", "#FADB28", "#14A852", "#317ABF"];
        const activeColors = [
          "#EAC4C3",
          "#F2D1AA",
          "#FBF5D9",
          "#8DD69D",
          "#90BBE1",
        ];
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 + index * 0.1 }}
          >
            <Button
              key={category}
              onClick={() => setTestMock(index)}
              className="whitespace-nowrap px-3 rounded-lg py-2 h-9 text-white text-base active:shadow-[0px_0px_0px_4px_#FFFFFF40]"
              style={{
                backgroundColor: colors[index % colors.length],
                boxShadow: `0px 0px 0px 3px ${
                  testMock === index
                    ? activeColors[index % colors.length]
                    : "transparent"
                }`,
              }}
            >
              {category}
            </Button>
          </motion.div>
        );
      })} */}
    </div>
  );
}
