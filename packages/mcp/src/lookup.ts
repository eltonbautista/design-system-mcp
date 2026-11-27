import type { ComponentEntry, Registry } from './registry.types'

/** Finds a component by name, case-insensitively, with or without the `Cab` prefix. */
export function resolveComponent(registry: Registry, name: string): ComponentEntry | { error: string } {
  const key = name.trim().toLowerCase().replace(/^cab-?/, '').replace(/-/g, '')
  const hit = registry.components.find(c => c.name.toLowerCase().replace(/^cab/, '') === key)
  if (hit) return hit
  const valid = registry.components.map(c => c.name).join(', ')
  return { error: `Unknown component "${name}". Valid components: ${valid}.` }
}
