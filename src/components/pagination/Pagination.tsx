import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslate } from "@refinedev/core";

interface PaginationProps {
  currentPage: number;
  hasPreviousPage: boolean;
  handlePageChange: (num: number) => void;
  totalPages: number;
  hasNextPage: boolean;
}

const Pagination = ({
  currentPage,
  hasPreviousPage,
  handlePageChange,
  totalPages,
  hasNextPage,
}: PaginationProps) => {
  const t = useTranslate();
  return (
    <div className="grid grid-cols-4 items-center px-4 py-4 mt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="border-0 !bg-transparent"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t("Previous")}
      </Button>
      <div className="text-sm text-muted-foreground col-span-2 text-center">
        {t("Page")} {currentPage} {t("of")} {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="border-0 !bg-transparent"
      >
        {t("Next")}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default Pagination;
