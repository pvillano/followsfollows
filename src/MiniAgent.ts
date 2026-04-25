import {JSONParser} from "@streamparser/json-whatwg";
import {devlog} from "./lib.ts";


interface ErrorSchema {
  error: string
  message: string
}

type SuccessPromise<S> = Promise<{
  success: false
  data: ErrorSchema
} | {
  success: true
  data: S
}>

type ProfileMap = Map<"did" | "avatar" | "handle" | "displayName", string>

export const globalUserLookup = new Map<string, ProfileMap>()

export async function searchActors(q: string): SuccessPromise<{cursor: string, actors: string[]}> {

  const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${q}`)
  const body = response.body
  if(body === null){
    throw new Error('Response body is null')
  }

  const jsonParser = new JSONParser({
    paths: ['$.error.*','$.message.*', '$.cursor', "$.actors.*.did", "$.actors.*.handle", "$.actors.*.displayName", "$.actors.*.avatar",],
    keepStack: false
  })

  const reader = body.pipeThrough(jsonParser).getReader();

  const otherKeys = new Map<"error" | "message" | "cursor", string>()
  const actors: string[] = []
  let currentDid: string | undefined;
  let userInProgress: ProfileMap | undefined = undefined
  while(true) {
    const { done, value: parsedElementInfo } = await reader.read();
    if(done){
      break
    }
    const { value, key, stack } = parsedElementInfo
    if(stack.length < 2){
      otherKeys.set(key as never, value as string)
      continue
    }
    //did is always the first key
    if(key == "did"){
      if(userInProgress){
        console.assert(currentDid !== undefined)
        globalUserLookup.set(currentDid!, userInProgress)
        userInProgress = undefined
      }

      currentDid = value as string
      actors.push(value as string)
      const index = stack[2].key as number;
      console.assert(index == actors.length - 1, index, actors.length)
      //assert values has the right length
      if(globalUserLookup.has(currentDid)){
        userInProgress = undefined
      } else {
        userInProgress = new Map([["did", currentDid]])
      }
    } else if (userInProgress){
      userInProgress.set(key as never, value as string)
    }
  }
  if(userInProgress){
    console.assert(currentDid !== undefined)
    globalUserLookup.set(currentDid!, userInProgress)
  }

  devlog(actors)
  devlog(otherKeys)

  if(otherKeys.has("error")){
    return {
      success: false as const,
      data: {error: otherKeys.get("error")!, message: otherKeys.get("message")!}
    }
  }
  return {
    success: true as const,
    data: {cursor: otherKeys.get("cursor")!, actors}
  }
}

export async function getFollows(actor: string, cursor?: string): SuccessPromise<{cursor: string, follows: string[]}> {
  let uri = `https://api.bsky.app/xrpc/app.bsky.graph.getFollows?actor=${encodeURIComponent(actor)}`
  if (cursor) {
    uri += `&cursor=${encodeURIComponent(cursor)}`
  }
  const response = await fetch(uri);

  const body = response.body
  if(body === null){
    throw new Error('Response body is null')
  }

  const jsonParser = new JSONParser({
    paths: ['$.error.*','$.message.*', '$.cursor', "$.follows.*.did", "$.follows.*.avatar", "$.follows.*.handle", "$.follows.*.displayName"],
    keepStack: false
  })

  const reader = body.pipeThrough(jsonParser).getReader();

  const otherKeys = new Map<"error" | "message" | "cursor", string>()
  const follows: string[] = []
  let currentDid: string | undefined;
  let userInProgress: ProfileMap | undefined = undefined
  while(true) {
    const { done, value: parsedElementInfo } = await reader.read();
    if(done){
      break
    }
    const { value, key, stack } = parsedElementInfo
    if(stack.length < 2){
      otherKeys.set(key as never, value as string)
      continue
    }
    //did is always the first key
    if(key == "did"){
      if(userInProgress){
        console.assert(currentDid !== undefined)
        globalUserLookup.set(currentDid!, userInProgress)
        userInProgress = undefined
      }

      currentDid = value as string
      follows.push(value as string)
      const index = stack[2].key as number;
      console.assert(index == follows.length - 1, index, follows.length)
      //assert values has the right length
      if(globalUserLookup.has(currentDid)){
        userInProgress = undefined
      } else {
        userInProgress = new Map([["did", currentDid]])
      }
    } else if (userInProgress){
      userInProgress.set(key as never, value as string)
    }
  }
  if(userInProgress){
    console.assert(currentDid !== undefined)
    globalUserLookup.set(currentDid!, userInProgress)
  }

  if(otherKeys.has("error")){
    return {
      success: false as const,
      data: {error: otherKeys.get("error")!, message: otherKeys.get("message")!}
    }
  }
  return {
    success: true as const,
    data: {cursor: otherKeys.get("cursor")!, follows}
  }
}
