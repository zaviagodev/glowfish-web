import { useTranslate } from "@refinedev/core";
import { OTPInput as BaseOTPInput, SlotProps } from 'input-otp';
import { cn } from "@/lib/utils";

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-12 h-16 text-[2rem]',
        'flex items-center justify-center',
        'border-input border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        { 'outline outline-1 outline-orangefocus': props.isActive },
      )}
    >
      {props.char !== null && <div className="font-sfpro-rounded">{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-background" />
    </div>
  );
}

function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-1 rounded-full bg-border" />
    </div>
  );
}

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ value, onChange }) => {
  return (
    <BaseOTPInput
      type="number"
      maxLength={6}
      value={value}
      onChange={onChange}
      containerClassName="group flex items-center justify-center has-[:disabled]:opacity-30"
      render={({ slots }) => (
        <>
          <div className="flex">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
          <FakeDash />
          <div className="flex">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  );
};