import type { ScoreData } from './ratingTypes'

class RecentScoreStorage {
  private scoreDataMap: Record<string, ScoreData> = {}
  private lastUpdated: string | null = null

  constructor () {
    this.scoreDataMap = {}
    this.lastUpdated = null
  }

  async clear (): Promise<void> {
    this.scoreDataMap = {}
    this.lastUpdated = 'null'
    await this.saveToStorage()
  }

  public async loadFromChromeStorage (): Promise<void> {
    const result = await chrome.storage.local.get(['recentScores', 'lastUpdated'])
    if (result.recentScores !== undefined) {
      this.scoreDataMap = result.recentScores
    }
    if (result.lastUpdated !== undefined) {
      this.lastUpdated = result.lastUpdated
    }
  }

  private formatDate (date: Date): string {
    const year = date.getFullYear().toString().slice(-2)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  private async saveToStorage (): Promise<void> {
    await chrome.storage.local.set({
      recentScores: this.scoreDataMap,
      lastUpdated: this.formatDate(new Date())
    })
  }

  async mergeMap (scoreDataMap: Record<string, ScoreData>): Promise<void> {
    for (const [songNo, scoreData] of Object.entries(scoreDataMap)) {
      delete scoreData.difficulty.hard
      delete scoreData.difficulty.normal
      delete scoreData.difficulty.easy
      await this.mergeSingle(songNo, scoreData)
    }
    await this.saveToStorage()
  }

  private async mergeSingle (songNo: string, scoreData: ScoreData): Promise<void> {
    if (this.scoreDataMap[songNo] === undefined) {
      this.scoreDataMap[songNo] = scoreData
    } else {
      this.scoreDataMap[songNo] = {
        ...this.scoreDataMap[songNo],
        difficulty: {
          ...this.scoreDataMap[songNo].difficulty,
          ...scoreData.difficulty
        }
      }
    }
  }

  getMap (): Record<string, ScoreData> {
    return this.scoreDataMap
  }

  getCount (): number {
    return Object.keys(this.scoreDataMap).length
  }

  getLastUpdated (): string | null {
    if (Object.keys(this.scoreDataMap).length === 0) {
      return null
    }
    return this.lastUpdated
  }
}

export default RecentScoreStorage