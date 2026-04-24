import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const devlog = import.meta.env.DEV ? console.log : () => {}

devlog("development mode")
