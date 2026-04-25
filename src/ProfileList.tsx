import {useMemo, useState} from "react";
import {globalUserLookup} from "./MiniAgent.ts";
import {Profile} from "./Profile.tsx";
import {Button} from "./components/Button.tsx";

export function ProfileList({profiles, myFollowIds, showDirect}: {
  profiles: { actor: string, score?: number }[],
  myFollowIds: Set<string>
  showDirect?: boolean
}) {

  const [count, setCount] = useState(10)

  const filtered = useMemo(() => profiles.filter(e => !myFollowIds.has(e.actor)).slice(0, count), [count, myFollowIds, profiles])

  return <div>
    <ul>
      {(showDirect ? profiles : filtered).map(e => {
        const actor = globalUserLookup.get(e.actor)!
        return <li key={e.actor} /*hidden={myFollowIds.has(e.actor.did)}*/>
          <a href={`https://bsky.app/profile/${actor.get("handle")}`} target="_blank" rel="noreferrer">
            <Profile  {...e} className={myFollowIds.has(e.actor) ? "border-2" : ""}/>
          </a>
        </li>;
      })}
    </ul>
    <Button className={"mx-2"}
            onClick={() => setCount(count + 10)}
            disabled={profiles.length <= count}
    >Show more</Button>
  </div>
}
