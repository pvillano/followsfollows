import {LoginForm} from "./LoginForm.tsx";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {followsFollows} from "./followsFollows.ts";
import {useState} from "react";

function App() {

  const [unweighted, setUnweighted] = useState<Awaited<ReturnType<typeof followsFollows>>['unweighted']>([])
  const [weighted, setWeighted] = useState<Awaited<ReturnType<typeof followsFollows>>['weighted']>([])

  const onFindFollowsFollows = async (profile: ProfileView) => {
    const {unweighted, weighted} = await followsFollows(profile.did)
    setUnweighted(unweighted)
    setWeighted(weighted)
  }

  return (
    <>
      <div className="flex flex-col m-4 gap-2">
        <LoginForm onFindFollowsFollows={onFindFollowsFollows}/>
        <div className="flex flex-col p-2 gap-2 border w-fit">Unweighted: {unweighted.map(e => e.actor.handle).join(", ")}</div>
        <div className="flex flex-col p-2 gap-2 border w-fit">Weighted: {
          weighted.map(e => e.actor.handle).join(", ")
        }</div>
      </div>
    </>
  )
}

export default App
