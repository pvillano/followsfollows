import type {ComponentProps} from "react";
import {cn} from "../lib.ts";

export const H2 = ({className, ...props}: ComponentProps<"h2">) =>
{
  return <h2 className={cn("text-lg", className)} {...props} />
}
