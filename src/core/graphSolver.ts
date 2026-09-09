import { ColorCode, CubeFaces } from '../types/cube'
import { GraphEdge, GameSolution } from '../types/graph'
import { isTowerSolved } from './towerValidator'

/**
 * Obtiene las 12 aristas del Grafo General (GL): 3 por cada uno de los 4 cubos.
 */
export function getGeneralGraphEdges(cubes: CubeFaces[]): GraphEdge[] {
  const edges: GraphEdge[] = []
  cubes.forEach((c, idx) => {
    const cubeId = idx + 1
    // Par 0: C1 - C2
    edges.push({ cubeId, pairIndex: 0, u: c.c1, v: c.c2 })
    // Par 1: C3 - C4
    edges.push({ cubeId, pairIndex: 1, u: c.c3, v: c.c4 })
    // Par 2: C5 - C6
    edges.push({ cubeId, pairIndex: 2, u: c.c5, v: c.c6 })
  })
  return edges
}

/**
 * Comprueba si una selección de 4 aristas (una por cada cubo) forma un subgrafo 2-regular:
 * Todos los 4 vértices ('R', 'B', 'V', 'A') deben tener grado exactamente igual a 2.
 */
function is2RegularSubgraph(pairs: [ColorCode, ColorCode][]): boolean {
  const degrees: Record<ColorCode, number> = { R: 0, B: 0, V: 0, A: 0 }
  for (const [u, v] of pairs) {
    if (u === v) {
      // Bucle / loop suma 2 al grado
      degrees[u] += 2
    } else {
      degrees[u] += 1
      degrees[v] += 1
    }
  }
  return (
    degrees.R === 2 &&
    degrees.B === 2 &&
    degrees.V === 2 &&
    degrees.A === 2
  )
}

/**
 * Encuentra todas las orientaciones dirigidas posibles de 4 aristas no dirigidas
 * de manera que cada vértice tenga exactamente in-degree = 1 y out-degree = 1.
 * Retorna las 4 aristas dirigidas: [{from, to}, ...]
 */
function getDirectedOrientations(pairs: [ColorCode, ColorCode][]): { from: ColorCode; to: ColorCode }[][] {
  const validOrientations: { from: ColorCode; to: ColorCode }[][] = []

  // Hay 2^4 = 16 formas de orientar las 4 aristas
  for (let mask = 0; mask < 16; mask++) {
    const directed: { from: ColorCode; to: ColorCode }[] = []
    const inDeg: Record<ColorCode, number> = { R: 0, B: 0, V: 0, A: 0 }
    const outDeg: Record<ColorCode, number> = { R: 0, B: 0, V: 0, A: 0 }

    for (let i = 0; i < 4; i++) {
      const bit = (mask >> i) & 1
      const [c1, c2] = pairs[i]
      const from = bit === 0 ? c1 : c2
      const to = bit === 0 ? c2 : c1
      directed.push({ from, to })
      outDeg[from]++
      inDeg[to]++
    }

    if (
      inDeg.R === 1 && outDeg.R === 1 &&
      inDeg.B === 1 && outDeg.B === 1 &&
      inDeg.V === 1 && outDeg.V === 1 &&
      inDeg.A === 1 && outDeg.A === 1
    ) {
      validOrientations.push(directed)
    }
  }

  return validOrientations
}

/**
 * Resuelve el juego de Locura Instantánea encontrando las soluciones formales por Teoría de Grafos
 * mediante un enfoque híbrido:
 * - Trata a {H1, H2} como un conjunto no ordenado para eliminar la redundancia de rotación global de 90°
 *   (intercambiar H1 y H2 en bloque equivale a cambiar el ángulo del observador sin alterar la torre).
 * - Mantiene las distintas orientaciones físicas locales de cada cubo (distintos pares físicos asignados).
 * - H1 determina el eje Izquierda (C6) y Derecha (C5)
 * - H2 determina el eje Superior (C3) e Inferior (C4)
 * - El par libre de cada cubo se asigna a C1 y C2 (bases no visibles de la columna)
 */
export function solveInstantInsanity(cubes: CubeFaces[]): GameSolution[] {
  if (cubes.length !== 4) return []

  // Pares de cada cubo: [cubo 0..3][par 0..2] -> [ColorCode, ColorCode]
  const cubePairs: [ColorCode, ColorCode][][] = cubes.map(c => [
    [c.c1, c.c2],
    [c.c3, c.c4],
    [c.c5, c.c6]
  ])

  const solutions: GameSolution[] = []

  // 1. Iterar sobre las 3^4 = 81 combinaciones de aristas para H1
  for (let i0 = 0; i0 < 3; i0++) {
    for (let i1 = 0; i1 < 3; i1++) {
      for (let i2 = 0; i2 < 3; i2++) {
        for (let i3 = 0; i3 < 3; i3++) {
          const h1Indices = [i0, i1, i2, i3]
          const h1Pairs: [ColorCode, ColorCode][] = [
            cubePairs[0][i0],
            cubePairs[1][i1],
            cubePairs[2][i2],
            cubePairs[3][i3]
          ]

          if (!is2RegularSubgraph(h1Pairs)) continue

          // 2. Para este H1, iterar sobre las 2^4 = 16 combinaciones disjuntas para H2
          for (let j0 = 0; j0 < 3; j0++) {
            if (j0 === i0) continue
            for (let j1 = 0; j1 < 3; j1++) {
              if (j1 === i1) continue
              for (let j2 = 0; j2 < 3; j2++) {
                if (j2 === i2) continue
                for (let j3 = 0; j3 < 3; j3++) {
                  if (j3 === i3) continue

                  const h2Indices = [j0, j1, j2, j3]

                  // Enfoque híbrido: tratamos a {H1, H2} como un conjunto no ordenado para descartar
                  // la rotación global de 90° de toda la torre (intercambio trivial H1 <-> H2).
                  // Exigimos que h1Indices sea lexicográficamente menor que h2Indices.
                  let isCanonicalOrder = false
                  for (let k = 0; k < 4; k++) {
                    if (h1Indices[k] !== h2Indices[k]) {
                      isCanonicalOrder = h1Indices[k] < h2Indices[k]
                      break
                    }
                  }
                  if (!isCanonicalOrder) continue

                  const h2Pairs: [ColorCode, ColorCode][] = [
                    cubePairs[0][j0],
                    cubePairs[1][j1],
                    cubePairs[2][j2],
                    cubePairs[3][j3]
                  ]

                  if (!is2RegularSubgraph(h2Pairs)) continue

                  // 3. Para este par único (H1, H2), encontrar una orientación dirigida válida
                  const h1DirList = getDirectedOrientations(h1Pairs)
                  const h2DirList = getDirectedOrientations(h2Pairs)

                  let foundForPair = false

                  for (const h1Dir of h1DirList) {
                    if (foundForPair) break
                    for (const h2Dir of h2DirList) {
                      // Construir la orientación espacial de los 4 cubos:
                      // C6 (Izquierda) = h1Dir.from, C5 (Derecha) = h1Dir.to
                      // C3 (Superior / Frontal lateral) = h2Dir.from, C4 (Inferior / Trasera lateral) = h2Dir.to
                      // C1 y C2 = el par libre restante
                      const resolvedCubes: CubeFaces[] = []

                      for (let c = 0; c < 4; c++) {
                        const freePairIdx = 3 - h1Indices[c] - h2Indices[c]
                        const freePair = cubePairs[c][freePairIdx]

                        resolvedCubes.push({
                          c1: freePair[0],
                          c2: freePair[1],
                          c3: h2Dir[c].from,
                          c4: h2Dir[c].to,
                          c5: h1Dir[c].to,
                          c6: h1Dir[c].from
                        })
                      }

                      // Comprobamos que sea solución estricta de la torre
                      if (isTowerSolved(resolvedCubes)) {
                        const h1Edges: GraphEdge[] = h1Indices.map((pairIdx, cIdx) => ({
                          cubeId: cIdx + 1,
                          pairIndex: pairIdx,
                          u: h1Pairs[cIdx][0],
                          v: h1Pairs[cIdx][1],
                          directed: { from: h1Dir[cIdx].from, to: h1Dir[cIdx].to }
                        }))

                        const h2Edges: GraphEdge[] = h2Indices.map((pairIdx, cIdx) => ({
                          cubeId: cIdx + 1,
                          pairIndex: pairIdx,
                          u: h2Pairs[cIdx][0],
                          v: h2Pairs[cIdx][1],
                          directed: { from: h2Dir[cIdx].from, to: h2Dir[cIdx].to }
                        }))

                        solutions.push({
                          index: solutions.length + 1,
                          h1: { edges: h1Edges },
                          h2: { edges: h2Edges },
                          cubeOrientations: resolvedCubes
                        })

                        foundForPair = true
                        break
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return solutions
}
