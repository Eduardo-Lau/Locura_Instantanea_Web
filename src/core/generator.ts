import { ColorCode, CubeFaces } from '../types/cube'
import { solveInstantInsanity } from './graphSolver'

const COLORS: ColorCode[] = ['R', 'B', 'V', 'A']

/**
 * Genera una configuración aleatoria de un cubo con 6 caras
 */
export function generateRandomCube(): CubeFaces {
  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    c1: getRandomColor(),
    c2: getRandomColor(),
    c3: getRandomColor(),
    c4: getRandomColor(),
    c5: getRandomColor(),
    c6: getRandomColor()
  }
}

/**
 * Genera una configuración aleatoria de los 4 cubos
 */
export function generateRandomCubes(): CubeFaces[] {
  return [
    generateRandomCube(),
    generateRandomCube(),
    generateRandomCube(),
    generateRandomCube()
  ]
}

/**
 * Genera una configuración de cubos que garantiza tener al menos una solución matemática
 */
export function generateSolvableCubes(maxAttempts = 500): CubeFaces[] {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateRandomCubes()
    const solutions = solveInstantInsanity(candidate)
    if (solutions.length > 0) {
      return candidate
    }
  }
  // Fallback a la clásica solvable si los intentos aleatorios no coincidieron
  return [
    { c1: 'A', c2: 'B', c3: 'V', c4: 'R', c5: 'R', c6: 'V' },
    { c1: 'A', c2: 'V', c3: 'R', c4: 'B', c5: 'V', c6: 'A' },
    { c1: 'R', c2: 'V', c3: 'B', c4: 'A', c5: 'B', c6: 'R' },
    { c1: 'V', c2: 'R', c3: 'A', c4: 'B', c5: 'A', c6: 'V' }
  ]
}

