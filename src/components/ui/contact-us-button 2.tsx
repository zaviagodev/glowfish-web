import { MessageCircleMore } from "lucide-react";
import { Button } from "./button";
import { useConfig } from "@/hooks/useConfig";

const ContactUsButton = () => {
  const { config } = useConfig();
  const contactUrl = config?.contactLink || "#";


  return (
    <Button 
      className="!bg-transparent flex items-center gap-2 text-foreground mx-auto p-0"
      onClick={() => window.open(contactUrl, "_blank", "noopener,noreferrer")}
    >
      <MessageCircleMore className="h-4 w-4" />
      Contact Us
    </Button>
  );
};

export default ContactUsButton;
