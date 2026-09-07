/**
 * Códigos de color permitidos:
 * R = Rojo (#9B1639)
 * B = Blanco (#F8FAFC)
 * V = Verde (#10AF6B)
 * A = Amarillo (#FFEA4E)
 */
export type ColorCode = 'R' | 'B' | 'V' | 'A'

export type ColorId = 0 | 1 | 2 | 3

export interface ColorDef {
  id: ColorId
  code: ColorCode
  name: string
  hex: string
  textColor: string // Color del texto (blanco para rojo/verde, oscuro para blanco/amarillo)
}

/**
 * 6 Caras de un cubo:
 * c1: Cara Frontal
 * c2: Cara Trasera
 * c3: Cara Superior
 * c4: Cara Inferior
 * c5: Cara Derecha
 * c6: Cara Izquierda
 */
export interface CubeFaces {
  c1: ColorCode
  c2: ColorCode
  c3: ColorCode
  c4: ColorCode
  c5: ColorCode
  c6: ColorCode
}

export interface CubeState {
  id: number // 1, 2, 3, 4
  faces: CubeFaces
}

export type RotationDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'clockwise'
  | 'counterclockwise'

/**
 * Columnas visibles de la torre (vistas laterales)
 */
export interface LateralViews {
  col1: ColorCode[] // Cara 3 (Superior / Frontal en torre) para cubos 1..4
  col2: ColorCode[] // Cara 5 (Derecha en torre) para cubos 1..4
  col3: ColorCode[] // Cara 4 (Inferior / Trasera en torre) para cubos 1..4
  col4: ColorCode[] // Cara 6 (Izquierda en torre) para cubos 1..4
}

