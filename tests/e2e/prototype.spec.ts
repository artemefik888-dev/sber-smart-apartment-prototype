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

  await page.getByTestId('home-smart-card').getByRole('link', { name: 'Подробнее об услуге' }).click()
  await expect(page).toHaveURL(/#\/help\/services\?section=smart-apartment$/)
  await expect(page.getByTestId('smart-question-1')).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByText('«Умная квартира Sber» объединяет освещение')).toBeVisible()
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

for (const route of ['#/', '#/help/services?section=smart-apartment', '#/calculator', '#/flow']) {
  test(`нет горизонтального переполнения на ${route}`, async ({ page }) => {
    await page.goto(`./${route}`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
