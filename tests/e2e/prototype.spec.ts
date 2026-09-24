import { expect, test } from '@playwright/test'

const smartQuestions = [
  'Что такое Умный дом',
  'Как заказать умный дом вместе с ремонтом',
  'Какие готовые решения можно выбрать',
  'Как умный дом учитывается в дизайн-проекте и смете',
  'Как проходят монтаж и настройка',
  'Что получает клиент после настройки',
]

test.beforeEach(async ({ page }) => {
  await page.goto('./#/')
  await page.evaluate(() => localStorage.clear())
})

test('карточка стоит между капитальным ремонтом и приемкой и ведет к первому открытому вопросу', async ({ page }) => {
  const serviceIds = await page.locator('[data-service-id]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-service-id')))
  expect(serviceIds.indexOf('smart')).toBe(serviceIds.indexOf('capital') + 1)
  expect(serviceIds.indexOf('acceptance')).toBe(serviceIds.indexOf('smart') + 1)
  await expect(page).toHaveTitle('Умный дом — интерактивный прототип')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Интерактивный прототип услуги «Умный дом» на витрине ремонта СберУслуг')
  const smartCard = page.getByTestId('home-smart-card')
  await expect(smartCard.locator('img.service-card__image')).toHaveAttribute('src', './assets/smart-home-hallway.jpg')
  await expect(smartCard).toContainText('Умный дом')
  await expect(smartCard).toContainText('Он создаёт')

  await page.getByTestId('home-smart-card').getByRole('link', { name: 'Подробнее об услуге' }).click()
  await expect(page).toHaveURL(/#\/help\/services\?section=smart-apartment$/)
  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  for (let index = 2; index <= 6; index += 1) await expect(page.getByTestId(`smart-question-${index}`)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Умный дом объединяет освещение', { exact: false })).toBeVisible()
})

test('умная группа стоит первой, а переход из вопроса 1 открывает 15 материалов вопроса 3', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  await expect(page.locator('.existing-faq-list')).toBeVisible()
  expect(await page.evaluate(() => {
    const smartGroup = document.querySelector('[data-testid="smart-faq-group"]')
    const existingGroup = document.querySelector('.existing-faq-list')
    return Boolean(smartGroup && existingGroup && smartGroup.compareDocumentPosition(existingGroup) & Node.DOCUMENT_POSITION_FOLLOWING)
  })).toBe(true)

  await page.getByTestId('smart-question-1').locator('..').getByRole('button', { name: 'Посмотреть готовые решения' }).click()
  const question3 = page.getByTestId('smart-question-3')
  await expect(question3).toHaveAttribute('aria-expanded', 'true')
  const question3Row = question3.locator('..')
  await expect(question3Row.getByRole('heading', { name: 'Решения по комнатам' })).toBeVisible()
  await expect(question3Row.getByRole('heading', { name: 'Готовые наборы' })).toBeVisible()
  await expect(question3Row.getByRole('heading', { name: 'Решения для всей квартиры' })).toBeVisible()
  await expect(question3Row.locator('a[download]')).toHaveCount(15)
  const roomLinks = question3Row.locator('.material-list').first().locator('a[download]')
  await expect(roomLinks).toHaveCount(6)
  await expect(roomLinks.first()).toHaveText('Ванная — базовый, комфорт, максимум')
  await expect(roomLinks.last()).toHaveText('Спальня — базовый, комфорт, максимум')
})

test('каталог устройств и инструкции доступны из согласованных вопросов', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Каталог устройств Умного дома' })).toHaveAttribute('href', 'https://cdn-app.sberdevices.ru/misc/0.0.0/assets/sd-help/94afd4ba_Katalog_ustroistv_umnogo_doma_Sber.pdf')
  await page.getByTestId('smart-question-5').click()
  await expect(page.getByRole('link', { name: 'Скачать инструкцию по монтажу и настройке, PDF' })).toHaveAttribute('download', '')
  await page.getByTestId('smart-question-6').click()
  await expect(page.getByRole('link', { name: 'Скачать каталог по настройке устройств и готовых сценариев, PDF' })).toHaveAttribute('download', '')
})

test('все 6 вопросов присутствуют и раскрываются независимо', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  const group = page.getByTestId('smart-faq-group')
  await expect(group.locator('button.faq-question')).toHaveCount(6)

  for (let index = 0; index < smartQuestions.length; index += 1) {
    const question = page.getByTestId(`smart-question-${index + 1}`)
    await expect(question).toContainText(smartQuestions[index])
    if (index > 0) await question.click()
    await expect(question).toHaveAttribute('aria-expanded', 'true')
  }

  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('smart-question-6')).toHaveAttribute('aria-expanded', 'true')
})

test('стрелка и чекбокс Умного дома работают независимо', async ({ page }) => {
  await page.goto('./#/calculator')
  const row = page.getByTestId('calculator-smart-service')
  const expand = row.getByRole('button', { name: 'Умный дом' })
  const checkbox = row.getByRole('checkbox')
  const checkboxControl = row.locator('label.service-check')

  await expand.click()
  await expect(expand).toHaveAttribute('aria-expanded', 'true')
  await expect(checkbox).not.toBeChecked()

  await checkboxControl.click()
  await expect(checkbox).toBeChecked()
  await expect(expand).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('selected-services')).toContainText('Умный дом')
})

test('выбор сохраняется до согласованного экрана успеха', async ({ page }) => {
  await page.goto('./#/calculator')
  const smartRow = page.getByTestId('calculator-smart-service')
  await smartRow.locator('label.service-check').click()
  await expect(smartRow.getByRole('checkbox')).toBeChecked()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByTestId('submit-prototype').click()

  await expect(page).toHaveURL(/#\/success$/)
  await expect(page.getByRole('heading', { name: 'Умный дом добавлен в заявку' })).toBeVisible()
  await expect(page.getByText('Менеджер уточнит нужные комнаты и сценарии во время звонка.')).toBeVisible()
})

test('незавершённая заявка сохраняется, а новый вход с главной после успеха очищает её', async ({ page }) => {
  await page.goto('./#/calculator')
  await page.getByTestId('calculator-smart-service').locator('label.service-check').click()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByLabel('Площадь, м²').fill('61')
  await page.reload()
  await expect(page.getByLabel('Площадь, м²')).toHaveValue('61')
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByTestId('submit-prototype').click()

  await page.getByRole('link', { name: 'На главную', exact: true }).click()
  await page.getByRole('link', { name: 'Оставить заявку' }).click()
  await expect(page).toHaveURL(/#\/calculator$/)
  await expect(page.getByRole('heading', { name: 'Какие услуги потребуются?' })).toBeVisible()
  await expect(page.getByTestId('calculator-smart-service').getByRole('checkbox')).not.toBeChecked()
  await expect(page.locator('[data-testid="selected-services"]')).toHaveCount(0)
})

for (const route of ['#/', '#/help/services?section=smart-apartment', '#/calculator', '#/flow']) {
  test(`нет горизонтального переполнения на ${route}`, async ({ page }) => {
    await page.goto(`./${route}`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
