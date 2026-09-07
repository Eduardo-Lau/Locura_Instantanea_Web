import { CubeFaces } from './cube'

export interface SavedGame {
  id: number
  timestamp: number
  cubes: CubeFaces[]
  hasSolution: boolean
  solutionCount: number
  label?: string
}

export interface StorageData {
  games: SavedGame[]
  currentCubes: CubeFaces[]
  activeSolutionIndex: number
}

