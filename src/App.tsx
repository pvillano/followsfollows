import {LoginForm} from "./LoginForm.tsx";
import {followsFollows} from "./followsFollows.ts";
import {useMemo, useState} from "react";
import {CheckboxToggle} from "./components/Checkbox.tsx";
import {H2} from "./components/Heading.tsx";
import {ProfileList} from "./ProfileList.tsx";

function App() {

  const [unweighted, setUnweighted] = useState<{ actor: string, score: number }[]>([])
  const [weighted, setWeighted] = useState<{ actor: string, score: number }[]>([])
  const [statistics, setStatistics] = useState<[string, string][]>([])
  const [showDirect, setShowDirect] = useState(true)
  const [myFollowIds, setMyFollowIds] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)

  const filterSet = useMemo(() => showDirect ? new Set<string>() : myFollowIds, [myFollowIds, showDirect])

  const onFindFollowsFollows = async (did: string) => {
    await followsFollows(did, {setWeighted, setUnweighted, setStatistics, setMyFollowIds, setRunning})
  }

  return (
    <>
      <div className="flex flex-col m-4 gap-2">
        <div className="flex flex-row gap-2">
          <LoginForm onFindFollowsFollows={onFindFollowsFollows} running={running}/>
          <div className="flex flex-col border p-2">
            <div className="flex-1">
              <H2>Option:</H2>
              <div className="flex flex-row gap-0.5">
                <CheckboxToggle checked={showDirect} onChange={(e) => setShowDirect(e.target.checked)}/>
                <label>Show accounts you already follow</label>
              </div>
            </div>
            <div className="flex-1">
              <H2>Statistics:</H2>
              <ul>
                {statistics.map(([k, v]) => <li key={k}>{k}: {v}</li>)}
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
