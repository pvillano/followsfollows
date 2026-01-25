import {type FormEventHandler, useId, useRef, useState} from "react";
import {agent, devlog} from "./lib.ts";

export function LoginForm() {
  const id = useId()
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("")
  const onLogin: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!usernameRef.current || !passwordRef.current) {
      setError("react fail")
      return
    }
    const response = await agent.login({
      identifier: usernameRef.current.value,
      password: passwordRef.current.value
    })
    devlog({response})
  }

  return <form className="flex flex-col m-4 p-2 gap-2 border w-fit" onSubmit={onLogin}>
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2">
        <label className="w-fit" htmlFor={id + "-username"}>Username: </label>
        <label className="w-fit" htmlFor={id + "-password"}>Password: </label>
      </div>
      <div className="flex flex-col gap-2">
        <input className="outline" id={id + "-username"} type="text" ref={usernameRef}/>
        <input className="outline" id={id + "-password"} type="password" ref={passwordRef}/>
      </div>
    </div>
    <button className="border w-fit px-2 disabled:bg-gray-200 shadow shadow-gray-700">Login</button>
    <div className="text-red-500">{error && `Error: ${error}`}</div>
  </form>
}
