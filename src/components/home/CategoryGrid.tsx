import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

export function CategoryGrid({ categories, isLoading, selectedCategory, onSelectCategory }: CategoryGridProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    navigate('/products', { state: { selectedCategory: categoryId } });
  };

  return (
    <div className="grid grid-cols-5 gap-2 p-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <>
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.32, 0.72, 0, 1]
                }}
                className="flex flex-col items-center gap-2"
              >
                <Skeleton 
                  className="w-10 h-10 rounded-lg bg-primary/5" 
                  shimmerDelay={index * 100}
                />
                <Skeleton 
                  className="w-12 h-3" 
                  shimmerDelay={index * 100 + 50}
                />
              </motion.div>
            ))}
          </>
        ) : (
          <>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCategoryClick(null)}
              className={cn(
                "flex flex-col items-center gap-2 p-2 rounded-lg",
                "hover:opacity-80 transition-opacity"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center",
                "transition-colors",
                selectedCategory === null && "bg-primary/10"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <span className="text-[10px] text-center line-clamp-2">
                All
              </span>
            </motion.button>
            {categories.slice(0, 10).map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.32, 0.72, 0, 1]
                }}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-lg",
                  "hover:opacity-80 transition-opacity"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center",
                  "transition-colors",
                  selectedCategory === category.id && "bg-primary/10"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <span className="text-[10px] text-center line-clamp-2">
                  {category.name}
                </span>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}