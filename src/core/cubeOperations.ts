import { CubeFaces, RotationDirection, ColorCode } from '../types/cube'

/**
 * Operaciones puras de rotación espacial 3D de un cubo con 6 caras:
 * c1: Frontal
 * c2: Trasera
 * c3: Superior
 * c4: Inferior
 * c5: Derecha
 * c6: Izquierda
 */

export function rotateUp(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c1: faces.c4,
    c2: faces.c3,
    c3: faces.c1,
    c4: faces.c2
  }
}

export function rotateDown(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c1: faces.c3,
    c2: faces.c4,
    c3: faces.c2,
    c4: faces.c1
  }
}

export function rotateLeft(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c1: faces.c5,
    c2: faces.c6,
    c5: faces.c2,
    c6: faces.c1
  }
}

export function rotateRight(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c1: faces.c6,
    c2: faces.c5,
    c5: faces.c1,
    c6: faces.c2
  }
}

export function rotateClockwise(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c3: faces.c6,
    c5: faces.c3,
    c4: faces.c5,
    c6: faces.c4
  }
}

export function rotateCounterClockwise(faces: CubeFaces): CubeFaces {
  return {
    ...faces,
    c3: faces.c5,
    c5: faces.c4,
    c4: faces.c6,
    c6: faces.c3
  }
}

export function rotateCube(faces: CubeFaces, direction: RotationDirection): CubeFaces {
  switch (direction) {
    case 'up':
      return rotateUp(faces)
    case 'down':
      return rotateDown(faces)
    case 'left':
      return rotateLeft(faces)
    case 'right':
      return rotateRight(faces)
    case 'clockwise':
      return rotateClockwise(faces)
    case 'counterclockwise':
      return rotateCounterClockwise(faces)
  }
}

/**
 * Retorna los 3 pares de caras opuestas del cubo:
 * Par 0: [c1, c2] (Frontal - Trasera)
 * Par 1: [c3, c4] (Superior - Inferior)
 * Par 2: [c5, c6] (Derecha - Izquierda)
 */
export function getOppositePairs(faces: CubeFaces): [ColorCode, ColorCode][] {
  return [
    [faces.c1, faces.c2],
    [faces.c3, faces.c4],
    [faces.c5, faces.c6]
  ]
}
