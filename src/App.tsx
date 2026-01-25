import {LoginForm} from "./LoginForm.tsx";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {followsFollows} from "./followsFollows.ts";
import {useState} from "react";
import {Profile} from "./Profile.tsx";

function ProfileList({profiles}: {profiles: { actor: ProfileView, score: number }[]}) {
  return <ul>
    {profiles.map(e => <li key={e.actor.did}>
      <a href={`https://bsky.app/profile/${e.actor.handle}`} target="_blank" rel="noreferrer">
        <Profile  {...e}/>
      </a>
    </li>)}
  </ul>
}

function App() {

  const [unweighted, setUnweighted] = useState<{actor: ProfileView, score: number}[]>([])
  const [weighted, setWeighted] = useState<{actor: ProfileView, score: number}[]>([])

  const onFindFollowsFollows = async (profile: ProfileView) => {
    await followsFollows(profile.did, setWeighted, setUnweighted)
  }

  return (
    <>
      <div className="flex flex-col m-4 gap-2">
        <LoginForm onFindFollowsFollows={onFindFollowsFollows}/>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Follows follows, weighted sort:</h2>
            <ProfileList profiles={weighted.slice(0, 10)}/>
          </div>
          <div className="flex flex-col p-2 gap-2 border w-fit">
            <h2>Follows follows, unweighted sort:</h2>
            <ProfileList profiles={unweighted.slice(0, 10)}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
