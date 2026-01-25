import {LoginForm} from "./LoginForm.tsx";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {followsFollows} from "./followsFollows.ts";
import {useState} from "react";
import {Profile} from "./Profile.tsx";
import {Button} from "./components/Button.tsx";

function ProfileList({profiles}: { profiles: { actor: ProfileView, score: number }[] }) {
  const [count, setCount] = useState(10)
  return <div>
    <ul>
      {profiles.slice(0,count).map(e => <li key={e.actor.did}>
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

  const onFindFollowsFollows = async (profile: ProfileView) => {
    await followsFollows(profile.did, setWeighted, setUnweighted, setStatistics)
  }

  return (
    <>
      <div className="flex flex-col m-4 gap-2">
        <div className="flex flex-row gap-2">
          <LoginForm onFindFollowsFollows={onFindFollowsFollows}/>
          <div className="border p-2">
            <h2>Statistics:</h2>
            <ul>
              {[...statistics.entries()].map(([k, v]) => <li key={k}>{k}: {v}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Your follows' follows, weighted score:</h2>
            <ProfileList profiles={weighted}/>
          </div>
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Your follows' follows, by follows:</h2>
            <ProfileList profiles={unweighted}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
