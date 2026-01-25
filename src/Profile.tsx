import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {cn} from "./lib.ts";
import type {ComponentProps} from "react";

const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})

export function Profile({actor, score, className, ...props}: {
  actor: ProfileView,
  score?: number
} & ComponentProps<"div">) {
  return <div
    className={cn("flex flex-row border m-2 p-2 gap-4 content-end", className)}
    {...props}
  >
    <img src={actor.avatar} className="w-10 h-10 rounded-full" alt="avatar"/>
    <div>{actor.handle} {score !== undefined && `(${formatter.format(score)} points)`}</div>
  </div>;
}
