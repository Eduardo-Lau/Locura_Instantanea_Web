import { ColorCode, ColorDef, CubeFaces } from '../types/cube'

export const COLORS: Record<ColorCode, ColorDef> = {
  R: {
    id: 0,
    code: 'R',
    name: 'Rojo',
    hex: '#9B1639',
    textColor: '#ffffff'
  },
  B: {
    id: 1,
    code: 'B',
    name: 'Blanco',
    hex: '#FFFFFF',
    textColor: '#111827'
  },
  V: {
    id: 2,
    code: 'V',
    name: 'Verde',
    hex: '#10AF6B',
    textColor: '#ffffff'
  },
  A: {
    id: 3,
    code: 'A',
    name: 'Amarillo',
    hex: '#FFEA4E',
    textColor: '#111827'
  }
}

export const COLOR_LIST: ColorDef[] = [
  COLORS.R,
  COLORS.B,
  COLORS.V,
  COLORS.A
]

/**
 * Colores característicos para identificar visualmente las aristas de cada cubo en los grafos:
 * Cubo 1: Naranja / Dorado (#f59e0b)
 * Cubo 2: Rojo / Carmesí (#ef4444)
 * Cubo 3: Verde (#22c55e)
 * Cubo 4: Azul / Celeste (#3b82f6)
 */
export const CUBE_EDGE_COLORS: Record<number, string> = {
  1: '#f59e0b',
  2: '#ef4444',
  3: '#22c55e',
  4: '#3b82f6'
}

/**
 * Configuración por defecto clásica (ejemplo de la imagen combinacion.png con solución válida):
 * Cubo 1: C1=A, C2=B, C3=V, C4=R, C5=R, C6=V
 * Cubo 2: C1=A, C2=V, C3=R, C4=B, C5=V, C6=A
 * Cubo 3: C1=R, C2=V, C3=B, C4=A, C5=B, C6=R
 * Cubo 4: C1=V, C2=R, C3=A, C4=B, C5=A, C6=V
 */
export const DEFAULT_CUBES: CubeFaces[] = [
  { c1: 'A', c2: 'B', c3: 'V', c4: 'R', c5: 'R', c6: 'V' },
  { c1: 'A', c2: 'V', c3: 'R', c4: 'B', c5: 'V', c6: 'A' },
  { c1: 'R', c2: 'V', c3: 'B', c4: 'A', c5: 'B', c6: 'R' },
  { c1: 'V', c2: 'R', c3: 'A', c4: 'B', c5: 'A', c6: 'V' }
]

