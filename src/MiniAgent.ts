import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
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

export type MiniProfileView = Pick<ProfileView, "did" | "avatar" | "handle" | "displayName">

export async function searchActors(q: string): SuccessPromise<{cursor: string, actors: MiniProfileView[]}> {

  const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${q}`)
  const body = response.body
  if(body === null){
    throw new Error('Response body is null')
  }

  const jsonParser = new JSONParser({
    paths: ['$.error.*','$.message.*', '$.cursor', "$.actors.*.did", "$.actors.*.avatar", "$.actors.*.handle", "$.actors.*.displayName"],
    keepStack: false
  })

  const reader = body.pipeThrough(jsonParser).getReader();

  const otherKeys = {
    error: undefined as string | undefined,
    message: undefined as string | undefined,
    cursor: undefined as string | undefined,
  }
  const actors: Partial<MiniProfileView>[] = []
  while(true) {
    const { done, value: parsedElementInfo } = await reader.read();
    if(done){
      break
    }
    const { value, key, stack } = parsedElementInfo
    if(stack.length < 2){
      otherKeys[key as keyof typeof otherKeys] = value as string
      continue
    }
    const index = stack[2].key as number;
    if (index >= actors.length){
      actors.push({})
    }
    actors[index][key as keyof MiniProfileView] = value as string | undefined;
  }

  devlog(actors)
  devlog(otherKeys)

  if(otherKeys.error){
    return {
      success: false as const,
      data: {error: otherKeys.error, message: otherKeys.message!}
    }
  }
  return {
    success: true as const,
    data: {cursor: otherKeys.cursor!, actors: actors as MiniProfileView[]}
  }
}

export async function getFollows(actor: string, cursor?: string): SuccessPromise<{cursor: string, follows: MiniProfileView[]}> {
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

  const otherKeys = {
    error: undefined as string | undefined,
    message: undefined as string | undefined,
    cursor: undefined as string | undefined,
  }
  const follows: Partial<MiniProfileView>[] = []
  while(true) {
    const { done, value: parsedElementInfo } = await reader.read();
    if(done){
      break
    }
    const { value, key, stack } = parsedElementInfo
    if(stack.length < 2){
      otherKeys[key as keyof typeof otherKeys] = value as string
      continue
    }
    const index = stack[2].key as number;
    if (index >= follows.length){
      follows.push({})
    }
    follows[index][key as keyof MiniProfileView] = value as string | undefined;
  }

  if(otherKeys.error){
    return {
      success: false as const,
      data: {error: otherKeys.error, message: otherKeys.message as string}
    }
  }
  return {
    success: true as const,
    data: {cursor: otherKeys.cursor!, follows: follows as MiniProfileView[]}
  }
}
