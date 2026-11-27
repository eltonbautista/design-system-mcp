// Runs judgmentChecks exactly as demo/score.ts does (under tsx), against a fixture page.
import { chromium } from 'playwright'
import { judgmentChecks } from '../../judgment'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(new URL('./good.html', import.meta.url).href)
console.log(JSON.stringify(await judgmentChecks(page)))
await browser.close()
