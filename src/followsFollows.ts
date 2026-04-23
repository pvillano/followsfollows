import {DefaultMap} from "./DefaultMap.ts";
import {getFollows, globalUserLookup} from "./MiniAgent.ts";


type SetStateFunction = (newValue: {
  actor: string
  score: number
}[]) => void

let lock = 0

export function stopFollowsFollowsFollows(): void {
  lock = performance.now() // everything started in the past stops
}

const globalFollowsMap = new Map<string, string[]>()

export async function followsFollows(
  actor: string,
  setters: {
    setWeighted: SetStateFunction,
    setUnweighted: SetStateFunction,
    setMyFollowIds: (idSet: Set<string>) => void,
    setStatistics: (statistics: [string, string][]) => void,
    setRunning: (running: boolean) => void
  }
) {
  const {
    setWeighted,
    setUnweighted,
    setStatistics,
    setMyFollowIds,
    setRunning
  } = setters
  const followsMap = new DefaultMap<string, string[]>(() => [])
  const startTime = performance.now()
  lock = Math.max(lock, startTime) // most recent wins
  let lastUpdate = -2000;

  let myFollowsList = globalFollowsMap.get(actor)

  if(myFollowsList === undefined) {
    const myFollowsResponse = await getAllFollows(actor)
    if (!myFollowsResponse.success) {
      throw new Error("Failed to fetch your follows")
    }
    myFollowsList = myFollowsResponse.data.follows
    globalFollowsMap.set(actor, myFollowsList)
  }

  followsMap.set(actor, myFollowsList)
  setMyFollowIds(new Set(myFollowsList))

  const workQueue: { actor: string, work: ReturnType<typeof getFollows> }[] = myFollowsList
    .filter(e => {
      const existingEntry = globalFollowsMap.get(e)
      if(existingEntry) {
        followsMap.set(e, existingEntry)
        return false
      }
      return true
    })
    .map(e => ({actor: e, work: getFollows(e)}))

  function updateStatus(){
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
      .map(e => ({actor: e[0], score: e[1]})))
    setWeighted([...weightedFollowCount.entries()]
      .sort(profileSortDescending)
      .map(e => ({actor: e[0], score: e[1]})))
    const formatter = new Intl.NumberFormat(undefined, {maximumFractionDigits: 2})
    // devlog([...followsMap.entries()])
    setStatistics([
      ["Users Processed", `${(myFollowsList!.length - workQueue.length)}/${myFollowsList!.length}`],
      ["Total Follows", `${totalFollows}`],
      ["Average Follows per User", `${formatter.format(averageFollowsCount)}`],
      ["Unique Users", `${globalUserLookup.size}`],
      ["Seconds Elapsed", `${(performance.now() - startTime)/1000}`]
    ])
    lastUpdate = performance.now()
  }

  while (workQueue.length > 0 && lock == startTime) {
    setRunning(true)
    const {actor, work} = workQueue.shift()!
    const {data, success} = await work
    if (!success) {
      throw new Error("Failed to fetch your follows follows")
    }
    const {cursor, follows} = data

    if (follows.length > 0) {
      followsMap.get(actor).push(...follows)
    }

    if (cursor) {
      workQueue.push({actor, work: getFollows(actor, cursor)})
    } else {
      if (!globalFollowsMap.has(actor)) {
        globalFollowsMap.set(actor, follows)
      }
    }

    if (performance.now() - lastUpdate > 100){
      updateStatus()
    }
  }
  updateStatus()
  setRunning(false)
}

const getAllFollows = async (actor: string) => {
  const allFollows: string[] = []

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
