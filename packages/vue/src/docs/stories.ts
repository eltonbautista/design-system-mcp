import type { Component } from 'vue'

/** A Storybook story that renders an example SFC and shows its real source as the code snippet. */
export function exampleStory(name: string, example: Component, code: string) {
  return {
    name,
    render: () => ({ components: { Example: example }, template: '<Example />' }),
    parameters: { docs: { source: { code, language: 'html' } } },
  }
}
