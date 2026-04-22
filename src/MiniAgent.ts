import type {
  OutputSchema as SearchActorsOutputSchema
} from "@atproto/api/src/client/types/app/bsky/actor/searchActors.ts";
import type {OutputSchema as GetFollowsOutputSchema} from "@atproto/api/src/client/types/app/bsky/graph/getFollows.ts";


interface ErrorSchema {
  error: string
  message: string
}

export async function searchActors(q: string) {
  const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${q}`)
  const data = await response.json()
  if("error" in data){
    return {
      success: false as const,
      data: data as ErrorSchema
    }
  }
  return {
    success: true as const,
    data: data as SearchActorsOutputSchema
  }
}

export async function getFollows(actor: string, cursor?: string) {
  let uri = `https://api.bsky.app/xrpc/app.bsky.graph.getFollows?actor=${encodeURIComponent(actor)}`
  if (cursor) {
    uri += `&cursor=${encodeURIComponent(cursor)}`
  }
  const response = await fetch(uri);
  const data = await response.json()
  if("error" in data){
    return {
      success: false as const,
      data: data as ErrorSchema
    }
  }return {
    success: true as const,
    data: data as GetFollowsOutputSchema
  }
}
