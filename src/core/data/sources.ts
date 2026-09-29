import { DataSource, InformationSources } from './index'

export type SourcePath = Array<string | number>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const getSource = (
  sources: InformationSources | undefined,
  path: SourcePath
): DataSource | undefined => {
  if (sources === undefined) {
    return undefined
  }
  let current: unknown = sources
  for (const segment of path) {
    if (current === undefined || current === null) {
      return undefined
    }
    if (Array.isArray(current)) {
      if (typeof segment !== 'number') {
        return undefined
      }
      current = current[segment]
    } else if (isRecord(current)) {
      current = current[String(segment)]
    } else {
      return undefined
    }
  }
  if (current === 'transcript' || current === 'return' || current === 'user') {
    return current
  }
  return undefined
}

const cloneContainer = (
  value: unknown,
  nextKey: SourcePath[number]
): Record<string, unknown> | unknown[] => {
  if (Array.isArray(value)) {
    return Array.from(value) as unknown[]
  }
  if (isRecord(value)) {
    return { ...value }
  }
  return typeof nextKey === 'number' ? [] : {}
}

export const setSource = (
  sources: InformationSources | undefined,
  path: SourcePath,
  source: DataSource | undefined
): InformationSources => {
  if (source === undefined) {
    return sources ?? {}
  }
  const root = cloneContainer(sources, path[0]) as Record<string, unknown>
  let current: Record<string, unknown> | unknown[] = root
  path.forEach((segment, index) => {
    const isLast = index === path.length - 1
    if (isLast) {
      if (Array.isArray(current) && typeof segment === 'number') {
        current[segment] = source
      } else if (!Array.isArray(current)) {
        current[String(segment)] = source
      }
      return
    }
    const nextKey = path[index + 1]
    const nextValue: unknown = Array.isArray(current)
      ? current[segment as number]
      : current[String(segment)]
    const nextContainer = cloneContainer(nextValue, nextKey)
    if (Array.isArray(current) && typeof segment === 'number') {
      current[segment] = nextContainer as unknown
    } else if (!Array.isArray(current)) {
      current[String(segment)] = nextContainer as unknown
    }
    current = nextContainer
  })
  return root
}

export const removeSourceIndex = (
  sources: InformationSources | undefined,
  path: SourcePath,
  index: number
): InformationSources | undefined => {
  if (sources === undefined) {
    return sources
  }
  const root = cloneContainer(sources, path[0]) as Record<string, unknown>
  let current: Record<string, unknown> | unknown[] = root
  path.forEach((segment, idx) => {
    const isLast = idx === path.length - 1
    if (isLast) {
      const list = Array.isArray(current)
        ? current
        : (current[String(segment)] as unknown[])
      if (Array.isArray(list)) {
        list.splice(index, 1)
        if (Array.isArray(current)) {
          current[segment as number] = list
        } else {
          current[String(segment)] = list
        }
      }
      return
    }
    const nextValue: unknown = Array.isArray(current)
      ? current[segment as number]
      : current[String(segment)]
    const nextContainer = cloneContainer(nextValue, path[idx + 1])
    if (Array.isArray(current)) {
      current[segment as number] = nextContainer as unknown
    } else {
      current[String(segment)] = nextContainer as unknown
    }
    current = nextContainer
  })
  return root
}
