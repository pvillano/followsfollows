import type {ComponentProps} from "react";
import {cn} from "../lib.ts";

export const Button = ({className, ...props}: ComponentProps<"button">) =>
{
  return <button className={cn("border w-fit px-2 shadow shadow-gray-700 disabled:bg-gray-200 disabled:text-gray-600", className)} {...props} />
}
