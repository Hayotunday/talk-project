import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

// Create a random 3-part ID like `abc-123-def`
export function generateRandomId() {
  return [1, 2, 3]
    .map(() => (Math.random().toString(36) + "000").substring(2, 5))
    .join("-");
}
