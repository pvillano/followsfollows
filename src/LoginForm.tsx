import {type FormEventHandler, type MouseEventHandler, useCallback, useId, useRef, useState} from "react";
import {cn, devlog} from "./lib.ts";
import {Button} from "./components/Button.tsx";
import {Profile} from "./Profile.tsx";
import {globalUserLookup, searchActors} from "./MiniAgent.ts";
import {stopFollowsFollowsFollows} from "./followsFollows.ts";

interface LoginFormProps {
  onFindFollowsFollows: (profile: string) => void
  running?: boolean
}


export function LoginForm({onFindFollowsFollows, running}: LoginFormProps) {
  const id = useId()
  const handleInputRef = useRef<HTMLInputElement>(null);
  const [yourProfileChoices, setYourProfileChoices] = useState<string[]>([])
  const [yourProfile, setYourProfile] = useState<string | null>(null)
  const [error, setError] = useState("")

  const onButtonClick: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault()
    if (!yourProfile) {
      setError("Please select a profile first.")
      return
    }
    onFindFollowsFollows(yourProfile);
  }, [onFindFollowsFollows, yourProfile]);

  const onSearchProfiles: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!handleInputRef.current) {
      return
    }
    try {
      const response = await searchActors(handleInputRef.current.value)
      devlog({response})
      if (!response.success) {
        setError(response.data.message)
        return
      }
      setYourProfile(null)
      setYourProfileChoices(response.data.actors)
      setError("")
    } catch (e) {
      setError(`${e}`)
      return
    }
  }

  return <form className="flex flex-col p-2 gap-2 border w-fit" onSubmit={onSearchProfiles}>
    <div className="flex flex-col gap-2">
      <label className="w-fit" htmlFor={id + "-handle"}>1: Search for Yourself: </label>
      <div className="flex flex-row gap-2 w-fit flex-nowrap">
        <input className="outline" id={id + "-handle"} type="text" ref={handleInputRef}
               placeholder="example.bsky.social"/>
        <Button>Search</Button>
      </div>
    </div>
    <div className="text-red-500">{error && `Error: ${error}`}</div>
    <label className={cn("w-fit", yourProfileChoices.length == 0 && "text-gray-500")}>2: Select Your Profile: </label>
    <div>
      {yourProfile ? <Profile actor={yourProfile} className="border-2"/> : <ul>
        {yourProfileChoices.map(did => {
          const profile = globalUserLookup.get(did)!
          return <li key={did}>
            <button
              className="flex flex-row border m-2 p-2 gap-4 content-end"
              onClick={() => {
                setYourProfile(did)
              }}>
              <img src={profile.get("avatar")} className="w-10 h-10 rounded-full" alt={`avatar for ${profile.get("handle")}`}/>
              <div>{profile.get("handle")}</div>
            </button>
          </li>;
        })}
      </ul>}
    </div>
    <label className="w-fit">3: Find your Follows' Follows!</label>
    <div className="flex flex-row gap-5">
      <Button disabled={yourProfile == null} onClick={onButtonClick}>Go!</Button>
      <Button disabled={!running} onClick={e => {e.preventDefault(); stopFollowsFollowsFollows()}}>Stop!</Button>
    </div>

  </form>
}
