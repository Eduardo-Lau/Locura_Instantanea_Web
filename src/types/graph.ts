import { ColorCode, CubeFaces } from './cube'

export interface GraphEdge {
  cubeId: number // 1, 2, 3, 4
  pairIndex: number // 0: C1-C2, 1: C3-C4, 2: C5-C6
  u: ColorCode
  v: ColorCode
  directed?: {
    from: ColorCode
    to: ColorCode
  }
}

export interface SubgraphSolution {
  edges: GraphEdge[] // 4 aristas, una por cada cubo
}

export interface GameSolution {
  index: number
  h1: SubgraphSolution // Eje Horizontal (Izquierda - Derecha)
  h2: SubgraphSolution // Eje Vertical (Superior - Inferior / Frente - Trasera torre)
  cubeOrientations: CubeFaces[] // Orientaciones resultantes para los cubos [Cubo1, Cubo2, Cubo3, Cubo4]
}

export interface NodePosition {
  code: ColorCode
  x: number
  y: number
  label: string
}

