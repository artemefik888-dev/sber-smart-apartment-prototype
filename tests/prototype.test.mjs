import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const data = await readFile(new URL('../src/data.ts', import.meta.url), 'utf8')
const analytics = await readFile(new URL('../src/analytics.ts', import.meta.url), 'utf8')

test('присутствуют шесть комнат и три уровня', () => {
  for (const room of ['hallway', 'bedroom', 'kitchen', 'kids', 'living', 'bathroom']) {
    assert.match(data, new RegExp(`id: '${room}'`))
  }
  for (const level of ['Базовый', 'Комфорт', 'Максимум']) assert.match(data, new RegExp(level))
})

test('зафиксированы согласованные наборы и решения', () => {
  for (const price of ['12 560 ₽', '22 740 ₽', '21 550 ₽', '16 550 ₽', '15 360 ₽']) assert.match(data, new RegExp(price))
  for (const price of ['39090', '57630', '79960', '29990', '14770', '3980', '16989']) assert.match(data, new RegExp(price))
})

test('маршруты и финальный текст присутствуют', () => {
  for (const route of ['/help/services', '/calculator', '/success', '/flow']) assert.match(app, new RegExp(route.replace('/', '\\/')))
  assert.match(app, /Умная квартира добавлена в заявку/)
})

test('все события аналитики объявлены', () => {
  for (const event of ['impression', 'expand', 'select', 'deselect', 'continue_selected', 'submit', 'handoff_flag']) {
    assert.match(analytics, new RegExp(`smart_apartment_${event}`))
  }
})
