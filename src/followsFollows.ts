import {DefaultMap} from "./DefaultMap.ts";
import {getFollows, type MiniProfileView} from "./MiniAgent.ts";


type SetStateFunction = (newValue: {
  actor: MiniProfileView
  score: number
}[]) => void

export async function followsFollows(
  actor: string,
  setters: {
    setWeighted: SetStateFunction,
    setUnweighted: SetStateFunction,
    setMyFollowIds: (idSet: Set<string>) => void,
    setStatistics: (statistics: Map<string, string>) => void
  }
) {
  const {
    setWeighted,
    setUnweighted,
    setStatistics,
    setMyFollowIds
  } = setters
  const followsMap = new DefaultMap<string, string[]>(() => [])
  const profileMap = new Map<string, MiniProfileView>()
  let lastUpdate = -2000;

  const myFollowsResponse = await getAllFollows(actor)
  if (!myFollowsResponse.success) {
    throw new Error("Failed to fetch your follows")
  }
  const myFollowsList = myFollowsResponse.data.follows.map(e => e.did)
  followsMap.set(actor, myFollowsList)
  setMyFollowIds(new Set(myFollowsList))

  myFollowsResponse.data.follows.forEach(e => profileMap.set(e.did, e))

  const workQueue: { actor: string, work: ReturnType<typeof getFollows> }[] = myFollowsResponse.data.follows
    .map(e => ({actor: e.did, work: getFollows(e.did)}))

  while (workQueue.length > 0) {
    const {actor, work} = workQueue.shift()!
    const {data, success} = await work
    if (!success) {
      throw new Error("Failed to fetch your follows follows")
    }
    const {cursor, follows} = data
    if (cursor) {
      workQueue.push({actor, work: getFollows(actor, cursor)})
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

      setUnweighted([...unWeightedFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: profileMap.get(e[0])!,
          score: e[1]
        })))
      setWeighted([...weightedFollowCount.entries()]
        .sort(profileSortDescending)
        .map(e => ({
          actor: profileMap.get(e[0])!,
          score: e[1]
        })))
      const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})
      // devlog([...followsMap.entries()])
      setStatistics(new Map([
        ["Users Processed", `${(myFollowsResponse.data.follows.length - workQueue.length)}/${myFollowsResponse.data.follows.length}`],
        ["Total Follows", `${totalFollows}`],
        ["Average Follows per User", `${formatter.format(averageFollowsCount)}`]
      ]))
      lastUpdate = performance.now()
    }
  }
}

const getAllFollows = async (actor: string) => {
  const allFollows: MiniProfileView[] = []

  let follows;
  let cursor = undefined
  let shouldLoop = true;

  do {
    const {data, success} = await getFollows(actor, cursor);
    if (!success) {
      return {data, success}
    }
    ({cursor, follows} = data as (Awaited<ReturnType<typeof getFollows>> & { success: true })['data'])
    allFollows.push(...follows)
    shouldLoop = !!(success && cursor)
  } while (shouldLoop)

  return {data: {follows: allFollows}, success: true}
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
