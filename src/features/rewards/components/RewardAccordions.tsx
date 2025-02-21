import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslate } from "@refinedev/core";

const RewardAccordions = () => {
  const t = useTranslate();
  const details = [
    {
      title: t("How to redeem the reward"),
      content: t(
        "Click the Redeem button below and show the code to our staff to claim your reward."
      ),
    },
    {
      title: t("Redemption condition"),
      content: t(
        "This reward can only be redeemed once and cannot be combined with other promotions."
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {details.map((detail) => (
        <Accordion type="single" collapsible key={detail.title}>
          <AccordionItem
            value="item-1"
            className="bg-darkgray border-0 text-sm px-5 py-4 rounded-lg"
          >
            <AccordionTrigger className="p-0">{detail.title}</AccordionTrigger>
            <AccordionContent className="pt-4 pb-0">
              {detail.content}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default RewardAccordions;
