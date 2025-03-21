import { FormLabel } from "@/components/ui/form";
import { useTheme } from "@/hooks/useTheme";

interface StarsSectionProps {
  value: number;
  title: string;
  activeColor: string;
  isError?: boolean;
  onChange: (value: number) => void;
}

const StarsSection = ({
  value = 0,
  title,
  activeColor,
  isError,
  onChange,
}: StarsSectionProps) => {
  const { currentTheme } = useTheme();
  const inactiveColor = currentTheme === "dark" ? "#343434" : "#9E9E9E";
  return (
    <section className="space-y-2">
      <FormLabel className="text-link dark:text-[#CFCFCF] text-base font-semibold flex items-center gap-2">
        {title}
      </FormLabel>
      <span className="flex justify-between items-center text-4xl">
        {Array.from({ length: 10 }, (_, index) => {
          const handleChange = () => onChange(index + 1);
          return (
            <svg
              key={index}
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              fill={index < value ? activeColor : inactiveColor}
              onClick={handleChange}
            >
              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
            </svg>
          );
        })}
      </span>
    </section>
  );
};

export default StarsSection;
