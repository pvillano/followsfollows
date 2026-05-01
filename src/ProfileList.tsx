import {type Dispatch, type SetStateAction, useMemo} from "react";
import {globalUserLookup} from "./MiniAgent.ts";
import {Profile} from "./Profile.tsx";
import {Button} from "./components/Button.tsx";

export function ProfileList({profiles, myFollowIds, showDirect, count, setCount}: {
  profiles: { actor: string, score?: number }[],
  myFollowIds: Set<string>
  showDirect?: boolean
  count: number
  setCount: Dispatch<SetStateAction<number>>
}) {

  const filtered = useMemo(() => {
      return profiles.filter(e => !myFollowIds.has(e.actor));
    }
    , [myFollowIds, profiles])
  
  let chosenList;
  if (showDirect) {
    chosenList = profiles;
  } else {
    chosenList = filtered;
  }
  
  //cheap, but not stable, memo
  const pagedList = useMemo(() => chosenList.slice(0, count), [count, chosenList])
  
  return <div>
    <ul>
      {pagedList.map(e => {
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
            disabled={chosenList.length <= count}
    >
      Show more
    </Button> (showing {Math.min(count, pagedList.length)} of {chosenList.length})
  </div>
}
