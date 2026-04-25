import {cn} from "./lib.ts";
import type {ComponentProps} from "react";
import {globalUserLookup} from "./MiniAgent.ts";

const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})

export function Profile({actor, score, className, ...props}: {
  actor: string,
  score?: number
} & ComponentProps<"div">) {
  const profile = globalUserLookup.get(actor)!
  return <div
    className={cn("flex flex-row border m-2 p-2 gap-4 content-end shadow shadow-gray-700", className)}
    {...props}
  >
    <img src={profile.get("avatar")} className="w-10 h-10 rounded-full" alt="avatar"/>
    <div>
      <div>{profile.get("displayName")} @{profile.get("handle")}</div>
      <div>{score !== undefined && `(${formatter.format(score)} follow${score > 1 ? 's' : ''})`}</div>
    </div>
  </div>;
}
