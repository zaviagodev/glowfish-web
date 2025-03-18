import { MessageCircleMore } from "lucide-react";
import { Button } from "./button";

const ContactUsButton = () => {
  return (
    <Button className="!bg-transparent flex items-center gap-2 text-foreground mx-auto p-0">
      <MessageCircleMore className="h-4 w-4" />
      Contact Us
    </Button>
  );
};

export default ContactUsButton;
