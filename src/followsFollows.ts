import {agent} from "./lib.ts";
import type {ProfileView} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {type Response as GetFollowsResponse} from "@atproto/api/src/client/types/app/bsky/graph/getFollows.ts";
import {DefaultMap} from "./DefaultMap.ts";


type SetStateFunction = (newValue: {
  actor: ProfileView
  score: number
}[]) => void

export async function followsFollows(
  actor: string,
  updateWeighted: SetStateFunction,
  updateUnweighted: SetStateFunction,
  setStatistics: (statistics: Map<string, string>) => void
) {

  const followsMap = new DefaultMap<string, string[]>(() => [])
  const profileMap = new Map<string, ProfileView>()
  let lastUpdate = -2000;

  const myfollowsResponse = await getAllfollows(actor)
  if (!myfollowsResponse.success) {
    throw new Error("Failed to fetch your follows")
  }

  const workQueue: { actor: string, work: Promise<GetFollowsResponse> }[] = myfollowsResponse.data.follows
    .map(e => ({actor: e.did, work: agent.getFollows({actor: e.did})}))

  while (workQueue.length > 0) {
    const {actor, work} = workQueue.shift()!
    const {data: {cursor, follows}, success} = await work
    if (cursor) {
      workQueue.push({actor, work: agent.getFollows({actor, cursor})})
    }
    if (!success) {
      throw new Error("Failed to fetch your follows follows")
    }
    if (follows.length > 0) {
      followsMap.get(actor).push(...follows.map(e => e.did))
    }
    follows.forEach(e => profileMap.set(e.did, e))

    if (performance.now() - lastUpdate > 100 || workQueue.length == 0) {
      let totalFollows = 0;
      for (const v of followsMap.values()) {
        totalFollows += v.length
      }
      const averageFollowsCount = totalFollows / followsMap.size

      const unWeightedFollowCount = new DefaultMap<string, number>(() => 0)
      const weightedFollowCount = new DefaultMap<string, number>(() => 0)
      for (const [, follows] of followsMap.entries()) {
        const multiplier = averageFollowsCount / follows.length
        for (const follow of follows) {
          unWeightedFollowCount.set(follow, unWeightedFollowCount.get(follow) + 1)
          weightedFollowCount.set(follow, weightedFollowCount.get(follow) + multiplier)
        }
      }

      updateUnweighted([...unWeightedFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: profileMap.get(e[0])!,
          score: e[1]
        })))
      updateWeighted([...weightedFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: profileMap.get(e[0])!,
          score: e[1]
        })))
      const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})
      // devlog([...followsMap.entries()])
      setStatistics(new Map([
        ["Users Processed", `${(myfollowsResponse.data.follows.length - workQueue.length)}/${myfollowsResponse.data.follows.length}`],
        ["Total Follows", `${totalFollows}`],
        ["Average Follows per User", `${formatter.format(averageFollowsCount)}`]
      ]))
      lastUpdate = performance.now()
    }
  }
}

const getAllfollows = async (actor: string) => {
  const allFollows: ProfileView[] = []
  let {data: {cursor, follows}, success} = await agent.getFollows({actor});
  allFollows.push(...follows)
  while (success && cursor) {
    ({data: {cursor, follows}, success} = await agent.getFollows({actor, cursor}));
    allFollows.push(...follows)
  }
  return {data: {follows: allFollows}, success}
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
