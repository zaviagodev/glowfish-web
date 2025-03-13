import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { useTranslate } from "@refinedev/core";
import { useEffect, useRef, useState } from "react";

interface LongParagraphProps {
  description: string;
}

const LongParagraph = ({ description }: LongParagraphProps) => {
  const t = useTranslate();
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    if (paragraphRef.current) {
      const style = window.getComputedStyle(paragraphRef.current);
      const lineHeight = parseFloat(style.lineHeight);
      const maxHeight = lineHeight * 3;
      setIsClamped(paragraphRef.current.scrollHeight > maxHeight);
    }
  }, [description]);

  return (
    <>
      <div
        ref={paragraphRef}
        className={cn(
          "text-sm text-secondary-foreground font-light",
          !expanded && "line-clamp-5"
        )}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(description || ""),
        }}
      />
      {isClamped && (
        <p
          className="text-orangefocus text-sm w-fit cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t("Read less...") : t("Read more...")}
        </p>
      )}
    </>
  );
};

export default LongParagraph;
