import type {
  OutputSchema as SearchActorsOutputSchema
} from "@atproto/api/src/client/types/app/bsky/actor/searchActors.ts";
import type {OutputSchema as GetFollowsOutputSchema} from "@atproto/api/src/client/types/app/bsky/graph/getFollows.ts";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


interface ErrorSchema {
  error: string
  message: string
}

export type MiniProfileView = Pick<ProfileView, "did" | "avatar" | "handle" | "displayName">

function stripProfileView({did, avatar, handle, displayName}: ProfileView): MiniProfileView {
  return {did, avatar, handle, displayName}
}

export async function searchActors(q: string) {
  const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${q}`)
  const data = await response.json() as ErrorSchema | SearchActorsOutputSchema
  if("error" in data){
    return {
      success: false as const,
      data
    }
  }
  return {
    success: true as const,
    data: {cursor: data.cursor, actors: data.actors.map(stripProfileView)}
  }
}

export async function getFollows(actor: string, cursor?: string) {
  let uri = `https://api.bsky.app/xrpc/app.bsky.graph.getFollows?actor=${encodeURIComponent(actor)}`
  if (cursor) {
    uri += `&cursor=${encodeURIComponent(cursor)}`
  }
  const response = await fetch(uri);
  const data = await response.json() as ErrorSchema | GetFollowsOutputSchema
  if("error" in data){
    return {
      success: false as const,
      data
    }
  }return {
    success: true as const,
    data: {cursor: data.cursor, follows: data.follows.map(stripProfileView)}
  }
}
