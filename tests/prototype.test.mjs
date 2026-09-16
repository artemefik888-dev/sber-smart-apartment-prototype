import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const data = await readFile(new URL('../src/data.ts', import.meta.url), 'utf8')
const analytics = await readFile(new URL('../src/analytics.ts', import.meta.url), 'utf8')

const smartQuestions = [
  'Что такое «Умная квартира Sber»',
  'Что можно автоматизировать в квартире',
  'Как заказать умную квартиру вместе с ремонтом',
  'Какие готовые решения можно выбрать',
  'Можно ли изменить готовый набор',
  'Как Умная квартира учитывается в дизайн-проекте и смете',
  'Сколько стоит Умная квартира',
  'Как проходят монтаж и настройка',
  'Что получает клиент после настройки',
  'Где посмотреть устройства и готовые сценарии',
  'Можно ли расширить систему после ремонта',
  'Какая поддержка доступна после установки',
]

test('главная остается витриной ремонта без отдельного промолендинга', () => {
  assert.match(app, /Ремонт с&nbsp;комфортом/)
  assert.doesNotMatch(app, /Дом, который понимает/)
  assert.doesNotMatch(app, /room-tabs|level-tabs|module-calculator/)
})

test('новая услуга стоит в требуемом порядке на главной и в калькуляторе', () => {
  assert.match(data, /id: 'capital'[\s\S]*id: 'smart'[\s\S]*id: 'acceptance'/)
  assert.match(data, /calculatorServices[\s\S]*id: 'capital'[\s\S]*id: 'smart'[\s\S]*id: 'control'/)
})

test('сохранены 21 существующий вопрос и все 12 новых вопросов без объединения', () => {
  const existingBlock = data.match(/export const existingFaq:[\s\S]*?export const smartQuestionTitles/)?.[0] ?? ''
  assert.equal((existingBlock.match(/question:/g) ?? []).length, 21)
  for (const question of smartQuestions) assert.ok(data.includes(question))
  for (let index = 0; index < 12; index += 1) assert.match(app, new RegExp(`case ${index}:`))
})

test('зафиксированы только согласованные цены материалов', () => {
  for (const price of ['12 560 ₽', '22 740 ₽', '21 550 ₽', '16 550 ₽', '15 360 ₽', '39 090 ₽', '57 630 ₽', '79 960 ₽', '29 990 ₽', '14 770 ₽', '3 980 ₽', '16 989 ₽']) assert.ok(app.includes(price))
  for (const forbidden of ['70 000 ₽', '110 000 ₽', '142 000 ₽']) assert.ok(!(app + data).includes(forbidden))
})

test('маршруты, согласованный success и события аналитики присутствуют', () => {
  for (const route of ['/help/services', '/calculator', '/success', '/flow']) assert.ok(app.includes(route))
  assert.match(app, /Умная квартира добавлена в заявку/)
  assert.match(app, /Менеджер уточнит нужные комнаты и сценарии во время звонка/)
  for (const event of ['impression', 'expand', 'select', 'deselect', 'continue_selected', 'submit', 'handoff_flag']) assert.match(analytics, new RegExp(`smart_apartment_${event}`))
})
