import {agent} from "./lib.ts";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


type SetStateFunction = (newValue: {
  actor: ProfileView
  score: number
}[]) => void

/**
 *
 * @param actor decentralized identifier
 * @param updateWeighted
 * @param updateUnweighted
 */
export async function followsFollows(actor: string, updateWeighted: SetStateFunction, updateUnweighted: SetStateFunction) {

  const rawFollowCount: Map<string, number> = new Map()
  const weightedFollowCount: Map<string, number> = new Map()
  const didToActor: Map<string, ProfileView> = new Map()
  let lastUpdate = -2000;

  const followersResponse = await getAllFollowers(actor)
  if (!followersResponse.success) {
    throw new Error("Failed to fetch your followers")
  }
  let totalFollowerCount = 0

  for (let i = 0; i < followersResponse.data.followers.length; i++) {
    const follower = followersResponse.data.followers[i];
    const followerFollowerResponse = await getAllFollowers(follower.did)
    if (!followerFollowerResponse.success) {
      throw new Error("Failed to fetch your follows follows")
    }
    totalFollowerCount += followerFollowerResponse.data.followers.length
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

    if (performance.now() - lastUpdate > 1000 || i == followersResponse.data.followers.length - 1) {
      const averageFollowerCount = totalFollowerCount / (i+1)
      updateUnweighted([...rawFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: didToActor.get(e[0])!,
          score: e[1]
        })))
      updateWeighted([...weightedFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: didToActor.get(e[0])!,
          score: e[1] * averageFollowerCount
        })))
      lastUpdate = performance.now()
    }
  }


}

const getAllFollowers = async (actor: string) => {
  const allFollowers: ProfileView[] = []
  let {data: {cursor, followers}, success} = await agent.getFollowers({actor});
  allFollowers.push(...followers)
  while (success && cursor) {
    ({data: {cursor, followers}, success} = await agent.getFollowers({actor, cursor}));
    allFollowers.push(...followers)
  }
  return {data: {followers: allFollowers}, success}
}


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
