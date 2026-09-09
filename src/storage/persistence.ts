import { CubeFaces } from '../types/cube'
import { SavedGame } from '../types/history'
import { DEFAULT_CUBES } from '../core/constants'

const STORAGE_KEY_HISTORY = 'locura_instantanea_history_v1'
const STORAGE_KEY_STATE = 'locura_instantanea_state_v1'

export function getHistory(): SavedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY)
    if (!raw) return []
    return JSON.parse(raw) as SavedGame[]
  } catch (err) {
    console.error('Error al cargar historial desde LocalStorage:', err)
    return []
  }
}

export function saveGameToHistory(game: Omit<SavedGame, 'id' | 'timestamp'>): SavedGame {
  try {
    const history = getHistory()
    const newId = history.length > 0 ? Math.max(...history.map(g => g.id)) + 1 : 1
    const newGame: SavedGame = {
      ...game,
      id: newId,
      timestamp: Date.now()
    }
    history.unshift(newGame) // Al inicio
    // Limitar a las últimas 50 partidas
    if (history.length > 50) {
      history.pop()
    }
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history))
    return newGame
  } catch (err) {
    console.error('Error al guardar partida en LocalStorage:', err)
    return {
      ...game,
      id: 1,
      timestamp: Date.now()
    }
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY)
  } catch (err) {
    console.error('Error al limpiar historial:', err)
  }
}

export interface CurrentState {
  baseCubes?: CubeFaces[]
  towerCubes?: CubeFaces[]
  cubes?: CubeFaces[] // compatibilidad hacia atrás
  activeSolutionIndex: number
  hasPendingChanges?: boolean
}

export function saveCurrentGameState(state: {
  baseCubes: CubeFaces[]
  towerCubes: CubeFaces[]
  activeSolutionIndex: number
  hasPendingChanges?: boolean
}): void {
  try {
    const payload = {
      baseCubes: state.baseCubes,
      towerCubes: state.towerCubes,
      cubes: state.towerCubes,
      activeSolutionIndex: state.activeSolutionIndex,
      hasPendingChanges: Boolean(state.hasPendingChanges)
    }
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(payload))
  } catch (err) {
    console.error('Error al guardar estado activo:', err)
  }
}

export function loadCurrentGameState(): {
  baseCubes: CubeFaces[]
  towerCubes: CubeFaces[]
  activeSolutionIndex: number
  hasPendingChanges: boolean
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE)
    if (raw) {
      const parsed = JSON.parse(raw)
      const isValid = (c: any) => Array.isArray(c) && c.length === 4
      const base = isValid(parsed.baseCubes)
        ? parsed.baseCubes
        : isValid(parsed.cubes)
          ? parsed.cubes
          : null
      const tower = isValid(parsed.towerCubes)
        ? parsed.towerCubes
        : (base ? JSON.parse(JSON.stringify(base)) : null)

      if (base && tower) {
        return {
          baseCubes: base,
          towerCubes: tower,
          activeSolutionIndex: typeof parsed.activeSolutionIndex === 'number' ? parsed.activeSolutionIndex : 1,
          hasPendingChanges: Boolean(parsed.hasPendingChanges)
        }
      }
    }
  } catch (err) {
    console.error('Error al leer estado guardado:', err)
  }
  return {
    baseCubes: JSON.parse(JSON.stringify(DEFAULT_CUBES)),
    towerCubes: JSON.parse(JSON.stringify(DEFAULT_CUBES)),
    activeSolutionIndex: 1,
    hasPendingChanges: false
  }
}

