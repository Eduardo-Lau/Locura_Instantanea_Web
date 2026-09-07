import { ColorCode, CubeFaces, LateralViews } from '../types/cube'

/**
 * Obtiene las 4 caras laterales de los 4 cubos colocados en la torre:
 * Columna 1: Cara c3 (Superior / Frontal de la torre)
 * Columna 2: Cara c5 (Derecha de la torre)
 * Columna 3: Cara c4 (Inferior / Trasera de la torre)
 * Columna 4: Cara c6 (Izquierda de la torre)
 */
export function getLateralViews(cubes: CubeFaces[]): LateralViews {
  return {
    col1: cubes.map(c => c.c3),
    col2: cubes.map(c => c.c5),
    col3: cubes.map(c => c.c4),
    col4: cubes.map(c => c.c6)
  }
}

/**
 * Verifica si 4 colores son todos distintos y no vacíos
 */
export function areFourDistinctColors(c1: ColorCode, c2: ColorCode, c3: ColorCode, c4: ColorCode): boolean {
  if (!c1 || !c2 || !c3 || !c4) return false
  const set = new Set([c1, c2, c3, c4])
  return set.size === 4
}

/**
 * Valida si la torre completa está resuelta (las 4 caras laterales tienen 4 colores distintos)
 */
export function isTowerSolved(cubes: CubeFaces[]): boolean {
  if (cubes.length !== 4) return false
  const views = getLateralViews(cubes)

  const c1Ok = areFourDistinctColors(views.col1[0], views.col1[1], views.col1[2], views.col1[3])
  const c2Ok = areFourDistinctColors(views.col2[0], views.col2[1], views.col2[2], views.col2[3])
  const c3Ok = areFourDistinctColors(views.col3[0], views.col3[1], views.col3[2], views.col3[3])
  const c4Ok = areFourDistinctColors(views.col4[0], views.col4[1], views.col4[2], views.col4[3])

  return c1Ok && c2Ok && c3Ok && c4Ok
}

