export interface Registry {
  /** npm package the components are imported from. */
  package: string
  /** Version of that package this registry was generated from. */
  version: string
  components: ComponentEntry[]
  tokens: TokenEntry[]
}

export interface ComponentEntry {
  name: string
  import: string
  description: string
  props: PropEntry[]
  events: { name: string; type: string; description: string }[]
  slots: { name: string; type: string; description: string }[]
  a11y: { summary: string; pattern: string; keyboard: string; focus: string; screenReader: string }
  examples: { name: string; description: string; code: string }[]
}

export interface PropEntry {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export type TokenEntry = { name: string; cssVar: string; value: string; type: string; description?: string }
