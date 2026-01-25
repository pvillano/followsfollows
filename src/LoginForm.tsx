import {type FormEventHandler, type MouseEventHandler, useCallback, useId, useRef, useState} from "react";
import {agent, devlog} from "./lib.ts";
import {Button} from "./components/Button.tsx";
import {type OutputSchema} from "@atproto/api/src/client/types/app/bsky/actor/searchActors.ts";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {Profile} from "./Profile.tsx";

interface LoginFormProps {
  // setProfile: Dispatch<SetStateAction<ProfileView>>,
  onFindFollowsFollows: (profile: ProfileView) => void }

export function LoginForm({onFindFollowsFollows}: LoginFormProps) {
  const id = useId()
  const handleInputRef = useRef<HTMLInputElement>(null);
  const [yourProfileChoices, setYourProfileChoices] = useState<OutputSchema["actors"]>([])
  const [yourProfile, setYourProfile] = useState<OutputSchema["actors"][0] | null>(null)
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
      const response = await agent.searchActors({q: handleInputRef.current.value})
      if (!response.success) {
        setError("Error: Failed to fetch profiles.")
      }
      devlog({response})
      setYourProfile(null)
      setYourProfileChoices(response.data.actors)
    } catch (e) {
      setError(`${e}`)
      return
    }
    setError("")
  }

  return <form className="flex flex-col p-2 gap-2 border w-fit" onSubmit={onSearchProfiles}>
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-fit">
        <label className="w-fit" htmlFor={id + "-handle"}>Your Handle: </label>
        <input className="outline" id={id + "-handle"} type="text" ref={handleInputRef} placeholder="safety.bsky.app"/>
      </div>
    </div>
    <div className="flex flex-row gap-2">
      <Button>Search</Button>
      <Button disabled={yourProfile == null} onClick={onButtonClick}>Find Follows' Follows!</Button>
    </div>
    <div className="text-red-500">{error && `Error: ${error}`}</div>
    <div>
      {yourProfile ? <Profile actor={yourProfile} className="border-2"/> : <ul>
        {yourProfileChoices.map(profile => <li key={profile.did}>
          <button
            className="flex flex-row border m-2 p-2 gap-4 content-end"
            onClick={() => {
              setYourProfile(profile)
            }}>
            <img src={profile.avatar} className="w-10 h-10 rounded-full" alt={`avatar for ${profile.handle}`}/>
            <div>{profile.handle}</div>
          </button>
        </li>)}
      </ul>}
    </div>
  </form>
}
