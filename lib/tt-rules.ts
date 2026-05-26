export function isValidSetScore(p1: number, p2: number): boolean {
  if (p1 === p2) return false
  const max = Math.max(p1, p2)
  const diff = Math.abs(p1 - p2)
  return max >= 11 && diff >= 2
}

export function setWinnerSide(p1: number, p2: number): 1 | 2 | null {
  if (!isValidSetScore(p1, p2)) return null
  return p1 > p2 ? 1 : 2
}

export function threshold(bestOf: number): number {
  return Math.floor(bestOf / 2) + 1
}

export function matchWinnerFromSets(
  sets: Array<{ player1_score: number; player2_score: number }>,
  player1Id: string,
  player2Id: string,
  bestOf: number
): string | null {
  const t = threshold(bestOf)
  let p1Sets = 0
  let p2Sets = 0
  for (const s of sets) {
    const w = setWinnerSide(s.player1_score, s.player2_score)
    if (w === 1) p1Sets++
    else if (w === 2) p2Sets++
  }
  if (p1Sets >= t && p1Sets > p2Sets) return player1Id
  if (p2Sets >= t && p2Sets > p1Sets) return player2Id
  return null
}

export function setsNeededToWin(bestOf: number): number {
  return threshold(bestOf)
}
