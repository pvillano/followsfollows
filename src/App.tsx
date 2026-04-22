import {LoginForm} from "./LoginForm.tsx";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {followsFollows} from "./followsFollows.ts";
import {useMemo, useState} from "react";
import {Profile} from "./Profile.tsx";
import {Button} from "./components/Button.tsx";
import {CheckboxToggle} from "./components/Checkbox.tsx";

function ProfileList({profiles, myFollowIds}: {
  profiles: { actor: ProfileView, score: number }[],
  myFollowIds: Set<string>
}) {
  const [count, setCount] = useState(10)
  // const realCount = useMemo(() => {
  //     const maybeLast = profiles.ite
  //       .map((v, i) => [v.actor.did, i] as const)
  //       .filter(([v]) => myFollowIds.has(v))
  //       .at(count);
  //     return maybeLast ? maybeLast[1] : profiles.length;
  //   }
  //   , [count, myFollowIds, profiles])
  return <div>
    <ul>
      {profiles.filter(e => !myFollowIds.has(e.actor.did)).slice(0, count).map(e =>
        <li key={e.actor.did} /*hidden={myFollowIds.has(e.actor.did)}*/>
        <a href={`https://bsky.app/profile/${e.actor.handle}`} target="_blank" rel="noreferrer">
          <Profile  {...e}/>
        </a>
      </li>)}
    </ul>
    <Button className={"mx-2"}
            onClick={() => setCount(count + 10)}
            disabled={profiles.length <= count}
    >Show more</Button>
  </div>
}

function App() {

  const [unweighted, setUnweighted] = useState<{ actor: ProfileView, score: number }[]>([])
  const [weighted, setWeighted] = useState<{ actor: ProfileView, score: number }[]>([])
  const [statistics, setStatistics] = useState(new Map<string, string>())
  const [showDirect, setShowDirect] = useState(true)
  const [myFollowIds, setMyFollowIds] = useState<Set<string>>(new Set())

  const filterSet = useMemo(() => showDirect ? new Set<string>() : myFollowIds, [myFollowIds, showDirect])

  const onFindFollowsFollows = async (profile: ProfileView) => {
    await followsFollows(profile.did, {setWeighted, setUnweighted, setStatistics, setMyFollowIds})
  }

  return (
    <>
      <div className="flex flex-col m-4 gap-2">
        <div className="flex flex-row gap-2">
          <LoginForm onFindFollowsFollows={onFindFollowsFollows}/>
          <div className="flex flex-col border p-2">
            <div className="flex-1">
              <h2>Options:</h2>
              <div className="flex flex-row gap-0.5">
                <CheckboxToggle checked={showDirect} onChange={(e) => setShowDirect(e.target.checked)}/>
                <label>Show your follows</label>
              </div>
            </div>
            <div className="flex-1">
              <h2>Statistics:</h2>
              <ul>
                {[...statistics.entries()].map(([k, v]) => <li key={k}>{k}: {v}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-0 min-w-fit">
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Your follows' follows, by weighted score:</h2>
            <ProfileList profiles={weighted} myFollowIds={filterSet}/>
          </div>
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Your follows' follows, by follow follows:</h2>
            <ProfileList profiles={unweighted} myFollowIds={filterSet}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
