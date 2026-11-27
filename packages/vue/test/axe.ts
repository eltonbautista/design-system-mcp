import axe from 'axe-core'

/** Runs axe-core on `root` and fails with each violation's id and help text. */
export async function expectNoA11yViolations(root: Element): Promise<void> {
  const { violations } = await axe.run(root, { resultTypes: ['violations'] })
  const summary = violations.map(v => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
  expect(summary, `axe violations:\n${summary.join('\n')}`).toEqual([])
}
