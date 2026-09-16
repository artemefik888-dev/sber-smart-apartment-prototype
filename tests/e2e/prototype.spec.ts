import { expect, test } from '@playwright/test'

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

test.beforeEach(async ({ page }) => {
  await page.goto('./#/')
  await page.evaluate(() => localStorage.clear())
})

test('карточка стоит между капитальным ремонтом и приемкой и ведет к первому открытому вопросу', async ({ page }) => {
  const serviceIds = await page.locator('[data-service-id]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-service-id')))
  expect(serviceIds.indexOf('smart')).toBe(serviceIds.indexOf('capital') + 1)
  expect(serviceIds.indexOf('acceptance')).toBe(serviceIds.indexOf('smart') + 1)
  await expect(page.getByTestId('home-smart-card').locator('img.service-card__image')).toHaveAttribute('src', './assets/smart-home-room.webp')

  await page.getByTestId('home-smart-card').getByRole('link', { name: 'Подробнее об услуге' }).click()
  await expect(page).toHaveURL(/#\/help\/services\?section=smart-apartment$/)
  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  for (let index = 2; index <= 12; index += 1) await expect(page.getByTestId(`smart-question-${index}`)).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('«Умная квартира Sber» объединяет освещение')).toBeVisible()
})

test('умная группа стоит первой, а переходы из вопросов 1 и 5 открывают 27 материалов вопроса 4', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  await expect(page.locator('.existing-faq-list')).toBeVisible()
  expect(await page.evaluate(() => {
    const smartGroup = document.querySelector('[data-testid="smart-faq-group"]')
    const existingGroup = document.querySelector('.existing-faq-list')
    return Boolean(smartGroup && existingGroup && smartGroup.compareDocumentPosition(existingGroup) & Node.DOCUMENT_POSITION_FOLLOWING)
  })).toBe(true)

  await page.getByTestId('smart-question-1').locator('..').getByRole('button', { name: 'Посмотреть готовые решения' }).click()
  const question4 = page.getByTestId('smart-question-4')
  await expect(question4).toHaveAttribute('aria-expanded', 'true')
  const question4Row = question4.locator('..')
  await expect(question4Row.getByRole('heading', { name: 'Решения по комнатам' })).toBeVisible()
  await expect(question4Row.getByRole('heading', { name: 'Готовые наборы' })).toBeVisible()
  await expect(question4Row.getByRole('heading', { name: 'Решения для всей квартиры' })).toBeVisible()
  await expect(question4Row.locator('a[download]')).toHaveCount(27)

  await page.getByTestId('smart-question-5').click()
  await page.getByTestId('smart-question-5').locator('..').getByRole('button', { name: 'Посмотреть готовые решения' }).click()
  await expect(question4).toHaveAttribute('aria-expanded', 'true')
})

test('инструкции в вопросах 8 и 9 скачиваются, ссылка совместимости ведёт на официальный сайт', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  await page.getByTestId('smart-question-8').click()
  await expect(page.getByRole('link', { name: 'Скачать инструкцию по монтажу и настройке, PDF' })).toHaveAttribute('download', '')
  await page.getByTestId('smart-question-9').click()
  await expect(page.getByRole('link', { name: 'Скачать каталог по настройке устройств и готовых сценариев, PDF' })).toHaveAttribute('download', '')
  await page.getByTestId('smart-question-11').click()
  await expect(page.getByRole('link', { name: 'Проверить совместимость устройств' })).toHaveAttribute('href', 'https://sberdevices.ru/help/smarthome/smarthome-about/devices/')
})

test('все 12 вопросов присутствуют и раскрываются независимо', async ({ page }) => {
  await page.goto('./#/help/services?section=smart-apartment')
  const group = page.getByTestId('smart-faq-group')
  await expect(group.locator('button.faq-question')).toHaveCount(12)

  for (let index = 0; index < smartQuestions.length; index += 1) {
    const question = page.getByTestId(`smart-question-${index + 1}`)
    await expect(question).toContainText(smartQuestions[index])
    if (index > 0) await question.click()
    await expect(question).toHaveAttribute('aria-expanded', 'true')
  }

  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('smart-question-12')).toHaveAttribute('aria-expanded', 'true')
})

test('стрелка и чекбокс Умной квартиры работают независимо', async ({ page }) => {
  await page.goto('./#/calculator')
  const row = page.getByTestId('calculator-smart-service')
  const expand = row.getByRole('button', { name: 'Умная квартира Sber' })
  const checkbox = row.getByRole('checkbox')
  const checkboxControl = row.locator('label.service-check')

  await expand.click()
  await expect(expand).toHaveAttribute('aria-expanded', 'true')
  await expect(checkbox).not.toBeChecked()

  await checkboxControl.click()
  await expect(checkbox).toBeChecked()
  await expect(expand).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('selected-services')).toContainText('Умная квартира Sber')
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
  await expect(page.getByRole('heading', { name: 'Умная квартира добавлена в заявку' })).toBeVisible()
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
