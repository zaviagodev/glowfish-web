import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const trailingCountryCodeRegex = /-([A-Z]{2})(?!.*-[A-Z]{2})/;

export const formattedDateAndTime = "dd MMM yyyy HH:mm";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategories(categories: any[]) {
  const result = {};
  categories.forEach((category) => {
    const route = category.route.split("/");
    let temp: any = result;
    route.forEach((r: string) => {
      const name = categories.find((c) => c.route.endsWith(r))?.name;
      if (!temp[name]) {
        temp[name] = {};
      }
      temp = temp[name];
    });
  });
  return result;
}

export function getFileURL(url?: string) {
  if (url?.startsWith("/")) {
    return `${import.meta.env.VITE_BACKEND_URL ?? ""}${url}`;
  }

  if (url == "" || url == null || url == undefined) {
    return null;
  }

  return url;
}

export function formatCurrency(value: number, currency: string = "THB") {
  const formattedValue = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency,
  }).format(value);

  const index = formattedValue.search(/\d/);
  const currencySymbol = formattedValue.slice(0, index);
  const numberValue = formattedValue.slice(index);

  return `${currencySymbol} ${numberValue}`;
}

export const generateTimeSlots = (): string[] => {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const period = hour < 12 ? 'AM' : 'PM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert to 12-hour format
    const time = `${formattedHour.toString().padStart(2, '0')}:00 ${period}`;
    times.push(time);
  }

  return times;
};