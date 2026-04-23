import {useMemo, useState} from "react";
import {globalUserLookup} from "./MiniAgent.ts";
import {Profile} from "./Profile.tsx";
import {Button} from "./components/Button.tsx";

export function ProfileList({profiles, myFollowIds}: {
  profiles: { actor: string, score: number }[],
  myFollowIds: Set<string>
}) {
  const [count, setCount] = useState(10)
  const filtered = useMemo(() => profiles.filter(e => !myFollowIds.has(e.actor)).slice(0, count), [count, myFollowIds, profiles])
  return <div>
    <ul>
      {filtered.map(e => {
        const actor = globalUserLookup.get(e.actor)!
        return <li key={e.actor} /*hidden={myFollowIds.has(e.actor.did)}*/>
          <a href={`https://bsky.app/profile/${actor.get("handle")}`} target="_blank" rel="noreferrer">
            <Profile  {...e}/>
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
