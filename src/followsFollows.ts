import {agent} from "./lib.ts";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


const profileSortDescending = (a: [did: string, score: number], b: [did: string, score: number]) => {
  if (b[1] - a[1] != 0) {
    return b[1] - a[1]
  }
  if (a[0] < b[0]) {
    return -1
  }
  if (a[0] > b[0]) {
    return 1
  }
  return 0
}

/**
 *
 * @param actor probably did
 */
export async function followsFollows(actor: string) {

  const rawFollowCount: Map<string, number> = new Map()
  const weightedFollowCount: Map<string, number> = new Map()
  const didToActor: Map<string, ProfileView> = new Map()

  const followersResponse = await agent.getFollowers({actor})
  if (!followersResponse.success) {
    throw new Error("Failed to fetch your followers")
  }
  for (const follower of followersResponse.data.followers) {
    const followerFollowerResponse = await agent.getFollowers({actor: follower.did})
    if (!followerFollowerResponse.success) {
      throw new Error("Failed to fetch your follows follows")
    }
    for (const followerFollower of followerFollowerResponse.data.followers) {
      rawFollowCount.set(
        followerFollower.did,
        (rawFollowCount.get(followerFollower.did) || 0) + 1
      )
      weightedFollowCount.set(
        followerFollower.did,
        (weightedFollowCount.get(followerFollower.did) || 0) + 1 / followerFollowerResponse.data.followers.length
      )
      didToActor.set(followerFollower.did, followerFollower)
    }
  }

  const unweighted = [...weightedFollowCount.entries()]
    .sort(profileSortDescending)
    .map(e => ({
      actor: didToActor.get(e[0])!,
      score: e[1]
    }))
  const weighted = [...rawFollowCount.entries()]
    .sort(profileSortDescending)
    .map(e => ({
      actor: didToActor.get(e[0])!,
      score: e[1]
    }))

  return {unweighted, weighted}
}
