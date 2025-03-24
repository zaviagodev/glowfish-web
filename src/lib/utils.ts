import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const trailingCountryCodeRegex = /-([A-Z]{2})(?!.*-[A-Z]{2})/;

export const formattedDateAndTime = "dd MMM yyyy";

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

export const makeTwoDecimals = (val: number) => {
  return Number.isInteger(val) ? val : val.toFixed(2);
}

// Helper function to handle different types of Google Maps links
export const getMapLinks = (mapLink: string) => {
  if (!mapLink || mapLink.trim() === "")
    return { viewLink: "", embedLink: "", isShareLink: false };

  // If it's already an embed link, return as is
  if (mapLink.includes("google.com/maps/embed")) {
    return {
      viewLink: mapLink.replace("/embed", "/place"),
      embedLink: mapLink,
      isShareLink: false,
    };
  }

  // If it's a share link (maps.app.goo.gl or goo.gl)
  if (mapLink.includes("goo.gl")) {
    return {
      viewLink: mapLink,
      embedLink: "", // Can't convert short links to embed
      isShareLink: true,
    };
  }

  // If it's a regular maps link
  if (mapLink.includes("google.com/maps")) {
    const embedLink = mapLink.includes("/place/")
      ? mapLink.replace("/place/", "/embed/place/")
      : mapLink.replace("/maps/", "/maps/embed/");
    return {
      viewLink: mapLink,
      embedLink,
      isShareLink: false,
    };
  }

  // If none of the above conditions match, consider it invalid
  return {
    viewLink: "",
    embedLink: "",
    isShareLink: false,
  };
};