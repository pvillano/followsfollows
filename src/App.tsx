import {LoginForm} from "./LoginForm.tsx";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {followsFollows} from "./followsFollows.ts";
import {useState} from "react";
import {cn} from "./lib.ts";


const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})

function Profile({actor, score}: {actor: ProfileView, score?: number}) {
  return <div
    className={cn("flex flex-row border m-2 p-2 gap-4 content-end")}>
    <img src={actor.avatar} className="w-10 h-10 rounded-full" alt="avatar"/>
    <div>{actor.handle} {score !== undefined && `(${formatter.format(score)} points)`}</div>
  </div>;
}

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
