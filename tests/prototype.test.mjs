import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const data = await readFile(new URL('../src/data.ts', import.meta.url), 'utf8')
const analytics = await readFile(new URL('../src/analytics.ts', import.meta.url), 'utf8')
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8')

const smartQuestions = [
  'Что такое Умный дом',
  'Как заказать умный дом вместе с ремонтом',
  'Какие готовые решения можно выбрать',
  'Как умный дом учитывается в дизайн-проекте и смете',
  'Как проходят монтаж и настройка',
  'Что получает клиент после настройки',
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

test('сохранены 21 существующий вопрос и ровно 6 вопросов Умного дома', () => {
  const existingBlock = data.match(/export const existingFaq:[\s\S]*?export const smartQuestionTitles/)?.[0] ?? ''
  assert.equal((existingBlock.match(/question:/g) ?? []).length, 21)
  for (const question of smartQuestions) assert.ok(data.includes(question))
  for (let questionIndex = 0; questionIndex < 6; questionIndex += 1) assert.match(app, new RegExp(`case ${questionIndex}:`))
  assert.doesNotMatch(app, /case 6:/)
})

test('зафиксированы только согласованные цены материалов', () => {
  for (const price of ['12 560 ₽', '22 740 ₽', '21 550 ₽', '16 550 ₽', '15 360 ₽', '39 090 ₽', '57 630 ₽', '79 960 ₽', '29 990 ₽', '14 770 ₽', '3 980 ₽', '16 989 ₽']) assert.ok(app.includes(price))
  for (const forbidden of ['70 000 ₽', '110 000 ₽', '142 000 ₽']) assert.ok(!(app + data).includes(forbidden))
})

test('маршруты, согласованный success, метаданные и события аналитики присутствуют', () => {
  for (const route of ['/help/services', '/calculator', '/success', '/flow']) assert.ok(app.includes(route))
  assert.match(app, /Умный дом добавлен в заявку/)
  assert.match(app, /Менеджер уточнит нужные комнаты и сценарии во время звонка/)
  assert.match(index, /<title>Умный дом — интерактивный прототип<\/title>/)
  assert.match(index, /Интерактивный прототип услуги «Умный дом» на витрине ремонта СберУслуг/)
  for (const event of ['impression', 'expand', 'select', 'deselect', 'continue_selected', 'submit', 'handoff_flag']) assert.match(analytics, new RegExp(`smart_apartment_${event}`))
})

test('подключены точные тексты FAQ и локальные материалы', () => {
  for (const text of [
    'Умный дом объединяет освещение, климат, защиту от протечек, контроль событий и мультимедиа в одну систему управления. Исполнитель учитывает устройства в проекте ремонта, устанавливает их на подходящих этапах работ, настраивает выбранные сценарии и показывает клиенту, как пользоваться системой.',
    'Управлять совместимыми устройствами можно в приложении и с помощью доступных голосовых команд. Точный состав системы зависит от площади, количества комнат, инженерных решений и задач клиента.',
    'Выберите умный дом в конфигураторе заявки или сообщите об этом менеджеру во время консультации. Менеджер уточнит задачи и передаст их исполнителю. Исполнитель предложит состав оборудования, проверит технические условия, добавит работы и устройства в смету. После согласования система становится частью общего проекта ремонта.',
    'Дизайнер или инженер отмечает размещение выключателей, розеток, датчиков, терморегуляторов, колонок и других устройств. Комплектатор готовит спецификацию оборудования. Монтаж, настройка и дополнительные работы указываются в смете отдельно от стоимости устройств, чтобы клиент видел полный состав решения.',
    'Исполнитель устанавливает устройства на подходящих этапах ремонта по согласованной схеме. После монтажа специалист подключает установленные устройства к системе, настраивает выбранные сценарии, проверяет их работу и показывает клиенту, как управлять системой в приложении и с помощью голосовых команд.',
    'После настройки исполнитель передаёт клиенту доступ к установленным устройствам и перечень настроенных сценариев. Он показывает работу основных функций и объясняет, как пользоваться системой и изменять доступные настройки. Клиент также получает инструкцию и контакты поддержки.',
  ]) assert.ok(app.includes(text))
  assert.ok(app.includes('<strong>Этапы:</strong> заявка, консультация, проект и смета, монтаж, настройка и передача.'))
  assert.ok(app.includes('Скачать инструкцию по монтажу и настройке, PDF'))
  assert.ok(app.includes('Скачать каталог по настройке устройств и готовых сценариев, PDF'))
  assert.ok(data.includes('Откройте для себя новый опыт жизни в квартире с системой умного дома. Он создаёт комфортную атмосферу и выполняет привычные действия по одной команде. Систему установят и настроят вместе с ремонтом.'))
  assert.ok(data.includes('Исполнитель спроектирует, установит и настроит систему умного дома вместе с ремонтом. Состав зависит от площади квартиры, количества комнат и выбранных сценариев. Окончательную стоимость специалист рассчитает после консультации. Услуга доступна в Москве и Санкт-Петербурге.'))
  assert.doesNotMatch(app, /Контакты требуют подтверждения|отдельно закрепляются|ссылки-заглушки|готовый материал Figma/)
})

test('третий ответ показывает 6 объединённых комнатных ссылок и сохраняет 27 исходных PDF', async () => {
  const folders = ['rooms', 'sets', 'apartment']
  const files = (await Promise.all(folders.map((folder) => readdir(new URL(`../public/materials/${folder}/`, import.meta.url))))).flat()
  assert.equal(files.filter((file) => file.endsWith('.pdf') && !file.includes('-basic-comfort-maximum')).length, 27)
  assert.equal((app.match(/basic-comfort-maximum\.pdf/g) ?? []).length, 6)
  assert.equal(files.filter((file) => file.includes('vannaya-maximum')).length, 1)
  assert.equal(files.filter((file) => file.includes('kuhnya-maximum')).length, 1)
})
