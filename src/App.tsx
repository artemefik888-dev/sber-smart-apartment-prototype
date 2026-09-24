import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { track, trackImpression } from './analytics'
import {
  calculatorServices,
  existingFaq,
  homeServices,
  materials,
  smartQuestionTitles,
} from './data'

const CALCULATOR_KEY = 'sber-smart-apartment-calculator-v2'
const CALCULATOR_COMPLETED_KEY = 'sber-smart-apartment-calculator-completed'

function Logo() {
  return (
    <span className="logo" aria-label="СберУслуги"><img src="./assets/main-logo.svg" alt="СберУслуги" /></span>
  )
}

function Header() {
  const location = useLocation()
  const isHelp = location.pathname.startsWith('/help')

  return (
    <header className="site-header">
      <div className="page-width site-header__inner">
        <Link to="/" aria-label="СберУслуги — на главную"><Logo /></Link>
        {!isHelp && (
          <nav className="main-nav" aria-label="Основная навигация">
            <Link to="/?anchor=services">Услуги</Link>
            <Link to="/?anchor=offers">Акции</Link>
            <Link to="/?anchor=how">Как это работает</Link>
            <Link to="/?anchor=portfolio">Портфолио</Link>
            <Link to="/?anchor=faq">Вопрос-ответ</Link>
          </nav>
        )}
        <span className="login">Войти</span>
      </div>
    </header>
  )
}

function Home() {
  const location = useLocation()
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anchor = new URLSearchParams(location.search).get('anchor')
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [location.search])

  useEffect(() => trackImpression('home_service_card'), [])

  const moveCarousel = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: direction * 396, behavior: 'smooth' })
  }

  return (
    <main>
      <section className="page-width home-hero" style={{ backgroundImage: "url('./assets/home-banner.webp')" }}>
        <div className="home-hero__content">
          <h1>Ремонт с&nbsp;комфортом</h1>
          <p>Оплачивайте работу поэтапно и следите за ходом ремонта онлайн с помощью сервиса «Ремонт со СберУслугами»</p>
          <div className="button-row">
            <Link className="primary-button" to="/calculator?source=main">Оставить заявку</Link>
            <Link className="secondary-button" to="/?anchor=portfolio">Посмотреть примеры</Link>
          </div>
        </div>
      </section>

      <section className="page-width features" aria-label="Преимущества">
        <div className="feature-image"><img src="./assets/home-gift.webp" alt="Преимущества" /></div>
        <article><span className="line-icon">✓</span><h2>Проверенные исполнители</h2><p>Все исполнители прошли юридическую проверку и дают гарантию на выполненные работы</p></article>
        <article><span className="line-icon">○</span><h2>Персональный менеджер</h2><p>Внимательный сотрудник службы поддержки будет рядом на протяжении всего ремонта и поможет найти ответ на ваш вопрос*</p></article>
        <article><span className="line-icon">□</span><h2>Безопасная оплата</h2><p>Ваши средства размещаются на специальном счете** и перечисляются исполнителю только после того, как вы примете работы</p></article>
        <article><span className="line-icon">◇</span><h2>Дизайн-проект или технадзор в подарок</h2><p>Вы можете получить бонус при использовании кредитных средств*** на ремонт</p></article>
      </section>

      <section className="page-width home-section" id="services">
        <div className="section-title-row">
          <h2>Услуги</h2>
          <div className="carousel-buttons" aria-label="Прокрутка услуг">
            <button type="button" aria-label="Предыдущие услуги" onClick={() => moveCarousel(-1)}>←</button>
            <button type="button" aria-label="Следующие услуги" onClick={() => moveCarousel(1)}>→</button>
          </div>
        </div>
        <div className="services-carousel" ref={carouselRef} data-testid="services-carousel">
          {homeServices.map((service) => (
            <article className="service-card" key={service.id} data-service-id={service.id} data-testid={service.id === 'smart' ? 'home-smart-card' : undefined}>
              {service.image ? <img className="service-card__image" src={service.image} alt={service.name} /> : null}
              <div className="service-card__body">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                {service.id === 'smart' ? (
                  <Link className="standard-link" to="/help/services?section=smart-apartment">Подробнее об услуге <span>→</span></Link>
                ) : (
                  <Link className="standard-link" to="/help/services">Подробнее об услуге <span>→</span></Link>
                )}
                <div className="availability"><span aria-hidden="true">⌖</span>{service.availability}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-width quick-application">
        <div className="quick-application__form">
          <h2>Заполните заявку за 3 шага</h2>
          <p>Мы перезвоним, чтобы сориентировать по цене и предложить максимально подходящего исполнителя</p>
          <fieldset><legend>Тип жилья</legend><label><input type="radio" name="homeType" defaultChecked /> Новостройка</label><label><input type="radio" name="homeType" /> Вторичка</label></fieldset>
          <label className="plain-field">Укажите площадь квартиры, м²<input type="number" min="10" aria-label="Укажите площадь квартиры, м²" /></label>
          <fieldset className="room-buttons"><legend>Количество комнат</legend>{[1, 2, 3, 4, 5].map((room) => <button type="button" key={room}>{room}</button>)}</fieldset>
          <Link className="primary-button" to="/calculator?source=main">Продолжить</Link>
        </div>
        <img src="./assets/calculator.webp" alt="" />
      </section>

      <section className="page-width home-section offer" id="offers">
        <h2>Предложения для вас</h2>
        <div className="offer__content"><div><h3>Получите бонус за кредит на ремонт</h3><p>При использовании кредитных средств на ремонт с нашим сервисом вы можете получить один из бонусов:</p><p><strong>Приемка черновых работ</strong><br />с инженером при сумме кредита от 500 000 ₽</p><p><strong>Дизайн-проект</strong><br />в подарок при сумме кредита от 900 000 ₽</p><a className="primary-button" href="https://www.sberbank.ru/ru/person/dist_services/vyezdnoj-menedzher?utm_source=uslugi&utm_medium=link&utm_campaign=repair&utm_content=landing" target="_blank" rel="noreferrer">Узнать свой кредитный потенциал</a></div></div>
      </section>

      <section className="page-width home-section" id="how">
        <h2>Как это работает?</h2>
        <div className="how-grid">
          {[
            ['Заявка', 'Оставьте заявку на сайте - менеджер свяжется с вами и уточнит детали, чтобы выбрать ремонтную компанию под ваш запрос'],
            ['Договор', 'К вам выезжает представитель компании и готовит смету. Если смета вас устраивает, то вы заключаете договор'],
            ['Начало ремонта', 'План ремонта отображается в вашем личном кабинете. Внесите предоплату за первый этап работ, чтобы ремонт начался'],
            ['Приемка', 'Вы принимаете работы онлайн или оффлайн. Деньги будут отправлены исполнителю только после того, как вы будете удовлетворены качеством работ'],
          ].map(([title, text], index) => <article key={title}><img src={`./assets/how/how-${index + 1}.webp`} alt={title} /><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="page-width home-section" id="portfolio">
        <h2>Работы наших партнеров</h2>
        <div className="portfolio-grid">
          {[
            ['1-комнатная квартира в ЖК Дубрава, Казань', '100 м²', '6 месяцев', '7 232 000 ₽'],
            ['2-комнатная квартира в ЖК Династия', '57 м²', '3 месяца', '1 149 800 ₽'],
            ['2-комнатная квартира в ЖК Мята', '34 м²', '3 месяца', '2 200 000 ₽'],
          ].map(([title, area, time, price], index) => <article key={title}><img src={`./assets/portfolio/portfolio-${index + 1}.webp`} alt="Портфолио" /><div><h3>{title}</h3><p>{area} <span>{time}</span></p><strong>{price}</strong></div></article>)}
        </div>
      </section>

      <section className="page-width home-section faq-preview" id="faq">
        <div className="section-title-row"><h2>Вопрос-ответ</h2><Link className="standard-link" to="/help/services">Перейти в раздел</Link></div>
        {['Что такое «Ремонт со СберУслугами»?', 'Как мне связаться с клиентским сервисом?', 'Сколько стоят ваши услуги?'].map((question) => <div key={question}>{question}<span>⌄</span></div>)}
      </section>

      <section className="page-width consultation">
        <h2>Заявка на консультацию</h2>
        <p>Оставьте свой номер телефона для консультации с менеджером и заполнения заявки на ремонт</p>
        <div className="consultation__row"><label><span>+7</span><input type="tel" aria-label="Номер телефона" /></label><button type="button" className="primary-button">Оставить заявку</button></div>
        <label className="consent"><input type="checkbox" /> Даю согласие на получение СМС-сообщений от сервиса, а также принимаю <a href="https://remont.sberuslugi.ru/help/agreements" target="_blank" rel="noreferrer">соглашение (оферту)</a></label>
      </section>
    </main>
  )
}

function AccordionRow({ id, title, open, onToggle, children, testId }: { id?: string; title: string; open: boolean; onToggle: () => void; children: ReactNode; testId?: string }) {
  return (
    <div className={`faq-item${open ? ' is-open' : ''}`} id={id}>
      <button type="button" className="faq-question" aria-expanded={open} onClick={onToggle} data-testid={testId}>
        <span>{title}</span><i aria-hidden="true" />
      </button>
      {open && <div className="faq-answer">{children}</div>}
    </div>
  )
}

function TextAnswer({ text }: { text: string }) {
  return <>{text.split(/\n\n/).map((paragraph) => <p key={paragraph}>{paragraph.split('\n').map((line, index) => <Fragment key={`${line}-${index}`}>{index > 0 && <br />}{line}</Fragment>)}</p>)}</>
}

const roomSolutions = [
  ['Ванная — базовый, комфорт, максимум', 'vannaya-basic-comfort-maximum.pdf'],
  ['Прихожая — базовый, комфорт, максимум', 'prihozhaya-basic-comfort-maximum.pdf'],
  ['Гостиная — базовый, комфорт, максимум', 'gostinaya-basic-comfort-maximum.pdf'],
  ['Детская — базовый, комфорт, максимум', 'detskaya-basic-comfort-maximum.pdf'],
  ['Кухня — базовый, комфорт, максимум', 'kuhnya-basic-comfort-maximum.pdf'],
  ['Спальня — базовый, комфорт, максимум', 'spalnya-basic-comfort-maximum.pdf'],
] as const
const roomSolutionsBase = 'https://github.com/artemefik888-dev/sber-smart-apartment-prototype/releases/download/room-solutions-2026-09-24'
const readySets = [
  ['Умная прихожая', 'от 12 560 ₽', 'Контроль входной двери, автоматическое включение света при открытии двери, колонка приветствует гостя, уведомление о входе/выходе.', 'gotovyy-nabor-umnaya-prihozhaya.pdf'],
  ['Умный свет', 'индивидуальный расчёт', 'Позволяет управлять светом удаленно через приложение или голосовыми командами.', 'gotovyy-nabor-umnyy-svet.pdf'],
  ['Умная спальня', '22 740 ₽', 'Ночью в комнате будет прохлада, при которой сон лучше и глубже, а днём — идеальная для активности умеренная температура.', 'gotovyy-nabor-umnaya-spalnya.pdf'],
  ['Умный климат', 'от 21 550 ₽', 'Умный дом следит за микроклиматом в квартире, помогает автоматически поддерживать идеальную температуру и влажность.', 'gotovyy-nabor-umnyy-klimat.pdf'],
  ['Безопасный дом', 'от 16 550 ₽', 'Защита от воров, забытых утюгов, перерасхода электричества и затопления квартиры, соседей.', 'gotovyy-nabor-bezopasnyy-dom.pdf'],
  ['Умная детская', '15 360 ₽', 'Умный дом создаст в детской правильную температуру для сна и мягкое освещение, которое постепенно погаснет.', 'gotovyy-nabor-umnaya-detskaya.pdf'],
] as const
const wholeApartment = [
  ['Компактное решение для студии или однокомнатной квартиры', '39 090 ₽', 'reshenie-dlya-kvartiry-s.pdf'],
  ['Решение для просторной однокомнатной или двухкомнатной квартиры', '57 630 ₽', 'reshenie-dlya-kvartiry-m.pdf'],
  ['Расширенное решение для двухкомнатной квартиры и квартиры большей площади', '79 960 ₽', 'reshenie-dlya-kvartiry-l.pdf'],
] as const

function SmartAnswer({ index, showReadySolutions }: { index: number; showReadySolutions: () => void }) {
  switch (index) {
    case 0:
      return <>
        <p>Умный дом объединяет освещение, климат, защиту от протечек, контроль событий и мультимедиа в одну систему управления. Исполнитель учитывает устройства в проекте ремонта, устанавливает их на подходящих этапах работ, настраивает выбранные сценарии и показывает клиенту, как пользоваться системой.</p>
        <p>Управлять совместимыми устройствами можно в приложении и с помощью доступных голосовых команд. Точный состав системы зависит от площади, количества комнат, инженерных решений и задач клиента.</p>
        <p className="answer-links"><button type="button" className="inline-link" onClick={showReadySolutions}>Посмотреть готовые решения</button><a href={materials.devices} target="_blank" rel="noreferrer">Каталог устройств Умного дома</a></p>
      </>
    case 1:
      return <>
        <p>Выберите умный дом в конфигураторе заявки или сообщите об этом менеджеру во время консультации. Менеджер уточнит задачи и передаст их исполнителю. Исполнитель предложит состав оборудования, проверит технические условия, добавит работы и устройства в смету. После согласования система становится частью общего проекта ремонта.</p>
        <p><strong>Этапы:</strong> заявка, консультация, проект и смета, монтаж, настройка и передача.</p>
      </>
    case 2:
      return <>
        <h4>Решения по комнатам</h4>
        <ul className="material-list">{roomSolutions.map(([name, filename]) => <li key={filename}><a href={`${roomSolutionsBase}/${filename}`} download>{name}</a><span>Скачать PDF</span></li>)}</ul>
        <h4>Готовые наборы</h4>
        <ul className="material-list">{readySets.map(([name, price, text, filename]) => <li key={name}><a href={`./materials/sets/${filename}`} download>{name} — {price}</a><span>{text}</span></li>)}</ul>
        <h4>Решения для всей квартиры</h4>
        <ul className="material-list">{wholeApartment.map(([name, price, filename]) => <li key={name}><a href={`./materials/apartment/${filename}`} download>{name} — {price}</a><span>Можно расширить: Безопасность — 29 990 ₽; расширенный Климат — 14 770 ₽; расширенный Свет — 3 980 ₽; Мультимедиа — 16 989 ₽.</span></li>)}</ul>
      </>
    case 3:
      return <p>Дизайнер или инженер отмечает размещение выключателей, розеток, датчиков, терморегуляторов, колонок и других устройств. Комплектатор готовит спецификацию оборудования. Монтаж, настройка и дополнительные работы указываются в смете отдельно от стоимости устройств, чтобы клиент видел полный состав решения.</p>
    case 4:
      return <>
        <p>Исполнитель устанавливает устройства на подходящих этапах ремонта по согласованной схеме. После монтажа специалист подключает установленные устройства к системе, настраивает выбранные сценарии, проверяет их работу и показывает клиенту, как управлять системой в приложении и с помощью голосовых команд.</p>
        <p><a href={materials.installation} download>Скачать инструкцию по монтажу и настройке, PDF</a></p>
      </>
    case 5:
      return <>
        <p>После настройки исполнитель передаёт клиенту доступ к установленным устройствам и перечень настроенных сценариев. Он показывает работу основных функций и объясняет, как пользоваться системой и изменять доступные настройки. Клиент также получает инструкцию и контакты поддержки.</p>
        <p><a href={materials.scenarios} download>Скачать каталог по настройке устройств и готовых сценариев, PDF</a></p>
      </>
    default:
      return null
  }
}

function HelpIcon({ type }: { type: number }) {
  const icons = ['mobile', 'man_badge', 'case', 'card_on_card', 'safe', 'gift', 'document_checkmark']
  return <span className="help-icon" aria-hidden="true"><img src={`./icons/help/${icons[type]}.svg`} alt="" /></span>
}

function HelpPage() {
  const location = useLocation()
  const smartGroupRef = useRef<HTMLDivElement>(null)
  const [existingOpen, setExistingOpen] = useState<string | null>(null)
  const [smartOpen, setSmartOpen] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    if (new URLSearchParams(location.search).get('section') !== 'smart-apartment') return
    setSmartOpen(new Set([0]))
    window.setTimeout(() => smartGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [location.search])

  const toggleSmart = (index: number) => {
    setSmartOpen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
    track('smart_apartment_expand', { placement: 'help_faq', question_number: index + 1 })
  }

  const showReadySolutions = () => {
    setSmartOpen((current) => new Set([...current, 2]))
    window.setTimeout(() => document.getElementById('smart-question-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const menu = ['О сервисе', 'Исполнители', 'Услуги', 'Оплата и возвраты', 'Кредитные предложения', 'Акции', 'Условия использования']

  return (
    <main className="page-width help-page">
      <Link className="back-home" to="/"><span>‹</span> На главную</Link>
      <h1>Помощь пользователям</h1>
      <div className="help-layout">
        <aside className="help-sidebar" aria-label="Разделы помощи">
          {menu.map((item, index) => <div className={item === 'Услуги' ? 'is-active' : ''} key={item}><HelpIcon type={index} /><span>{item}</span></div>)}
        </aside>
        <section className="help-content">
          <h2>Услуги</h2>
          <div className="smart-faq-group" id="smart-apartment" ref={smartGroupRef} data-testid="smart-faq-group">
            <h3>Умный дом</h3>
            {smartQuestionTitles.map((title, index) => <AccordionRow id={`smart-question-${index + 1}`} key={title} title={title} open={smartOpen.has(index)} onToggle={() => toggleSmart(index)} testId={`smart-question-${index + 1}`}><SmartAnswer index={index} showReadySolutions={showReadySolutions} /></AccordionRow>)}
          </div>
          <div className="faq-list existing-faq-list">
            {existingFaq.map((item) => <AccordionRow key={item.id} title={item.question} open={existingOpen === item.id} onToggle={() => setExistingOpen(existingOpen === item.id ? null : item.id)}><TextAnswer text={item.answer} /></AccordionRow>)}
          </div>
        </section>
      </div>
      <section className="questions-footer"><h2>Остались вопросы?</h2><p>Напишите нам на почту: <a href="mailto:request@sberuslugi.ru">request@sberuslugi.ru</a></p></section>
    </main>
  )
}

type CalculatorState = {
  step: number
  selectedServices: string[]
  objectType: string
  area: string
  rooms: string
  functions: string
  hasProject: string
  repairStage: string
  comment: string
}

const defaultCalculator: CalculatorState = {
  step: 1,
  selectedServices: [],
  objectType: 'Вторичка',
  area: '',
  rooms: '1',
  functions: '',
  hasProject: 'Нет',
  repairStage: 'Планирую ремонт',
  comment: '',
}

function loadCalculator(): CalculatorState {
  try {
    const saved = localStorage.getItem(CALCULATOR_KEY)
    return saved ? { ...defaultCalculator, ...JSON.parse(saved) as Partial<CalculatorState> } : defaultCalculator
  } catch {
    return defaultCalculator
  }
}

function loadCalculatorForEntry(search: string): CalculatorState {
  const isNewApplication = new URLSearchParams(search).get('source') === 'main'
    && localStorage.getItem(CALCULATOR_COMPLETED_KEY) === '1'
  if (!isNewApplication) return loadCalculator()
  localStorage.removeItem(CALCULATOR_KEY)
  localStorage.removeItem(CALCULATOR_COMPLETED_KEY)
  return { ...defaultCalculator, selectedServices: [] }
}

function CalculatorSummary({ state }: { state: CalculatorState }) {
  const selected = calculatorServices.filter((service) => state.selectedServices.includes(service.id))
  return (
    <aside className="calculator-summary">
      <div className="summary-step"><span><b />••</span><strong>ШАГ {state.step} ИЗ 3</strong></div>
      <p className="summary-label">ВАШ ОБЪЕКТ</p>
      <p className="summary-object">{state.objectType}, {state.area ? `${state.area} м²` : 'м²'}, комнат: {state.rooms}</p>
      {selected.length > 0 && <><p className="summary-label">ВЫБРАННЫЕ УСЛУГИ</p><ul data-testid="selected-services">{selected.map((service) => <li key={service.id}>{service.name}</li>)}</ul></>}
    </aside>
  )
}

function CalculatorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<CalculatorState>(() => loadCalculatorForEntry(location.search))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const processedDeepLink = useRef(false)
  const allSelected = state.selectedServices.length === calculatorServices.length

  useEffect(() => localStorage.setItem(CALCULATOR_KEY, JSON.stringify(state)), [state])
  useEffect(() => {
    if (new URLSearchParams(location.search).get('source') === 'main') navigate('/calculator', { replace: true })
  }, [location.search, navigate])
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('smart') !== '1' || processedDeepLink.current) return
    processedDeepLink.current = true
    setState((current) => ({ ...current, step: 1, selectedServices: current.selectedServices.includes('smart') ? current.selectedServices : [...current.selectedServices, 'smart'] }))
    track('smart_apartment_select', { placement: params.get('source') ?? 'deep-link' })
    navigate('/calculator', { replace: true })
  }, [location.search, navigate])

  const update = (patch: Partial<CalculatorState>) => setState((current) => ({ ...current, ...patch }))
  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (id === 'smart' && !expanded.has(id)) track('smart_apartment_expand', { placement: 'calculator' })
  }
  const toggleService = (id: string) => {
    const selected = state.selectedServices.includes(id)
    update({ selectedServices: selected ? state.selectedServices.filter((item) => item !== id) : [...state.selectedServices, id] })
    if (id === 'smart') track(selected ? 'smart_apartment_deselect' : 'smart_apartment_select', { placement: 'calculator' })
  }
  const toggleAll = () => {
    const next = allSelected ? [] : calculatorServices.map((service) => service.id)
    const hadSmart = state.selectedServices.includes('smart')
    update({ selectedServices: next })
    if (hadSmart !== next.includes('smart')) track(next.includes('smart') ? 'smart_apartment_select' : 'smart_apartment_deselect', { placement: 'select_all' })
  }
  const nextStep = () => {
    if (state.step === 1 && state.selectedServices.includes('smart')) track('smart_apartment_continue_selected', { selected_services: state.selectedServices })
    update({ step: Math.min(3, state.step + 1) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const submit = () => {
    const smartSelected = state.selectedServices.includes('smart')
    track('smart_apartment_submit', { smart_selected: smartSelected, area: state.area, rooms: state.rooms })
    track('smart_apartment_handoff_flag', { handoff_required: smartSelected, service_id: 'smart' })
    localStorage.setItem(CALCULATOR_COMPLETED_KEY, '1')
    navigate('/success')
  }

  return (
    <main className="calculator-page">
      <div className="page-width calculator-layout">
        <section className="calculator-main">
          <div className="calculator-heading"><button type="button" aria-label="Назад" onClick={() => state.step > 1 ? update({ step: state.step - 1 }) : navigate('/')}>←</button><h1>{state.step === 1 ? 'Какие услуги потребуются?' : state.step === 2 ? 'Данные для консультации' : 'Заявка'}</h1></div>
          {state.step === 1 && <>
            <div className="calculator-services">
              {calculatorServices.map((service) => {
                const isOpen = expanded.has(service.id)
                const isSelected = state.selectedServices.includes(service.id)
                return <article className={`calculator-service${isSelected ? ' is-selected' : ''}`} key={service.id} data-service-id={service.id} data-testid={service.id === 'smart' ? 'calculator-smart-service' : undefined}>
                  <button type="button" className="service-expand" aria-expanded={isOpen} onClick={() => toggleExpanded(service.id)}><span>{service.name}</span><i aria-hidden="true" /></button>
                  <label className="service-check" aria-label={`${isSelected ? 'Убрать' : 'Выбрать'} услугу ${service.name}`}><input type="checkbox" checked={isSelected} onChange={() => toggleService(service.id)} /><span /></label>
                  {isOpen && <div className="service-description"><p>{service.description}</p></div>}
                </article>
              })}
            </div>
            <label className="select-all"><span>Выбрать все услуги</span><input type="checkbox" checked={allSelected} onChange={toggleAll} /></label>
          </>}
          {state.step === 2 && <div className="form-grid">
            <label className="field">Тип объекта<select value={state.objectType} onChange={(event) => update({ objectType: event.target.value })}><option>Вторичка</option><option>Новостройка</option></select></label>
            <label className="field">Площадь, м²<input type="number" min="10" value={state.area} onChange={(event) => update({ area: event.target.value })} /></label>
            <label className="field">Количество комнат<select value={state.rooms} onChange={(event) => update({ rooms: event.target.value })}>{['1', '2', '3', '4', '5'].map((room) => <option key={room}>{room}</option>)}</select></label>
            <label className="field">Наличие дизайн-проекта<select value={state.hasProject} onChange={(event) => update({ hasProject: event.target.value })}><option>Нет</option><option>Да</option></select></label>
            <label className="field field--wide">Этап ремонта<select value={state.repairStage} onChange={(event) => update({ repairStage: event.target.value })}><option>Планирую ремонт</option><option>Идут черновые работы</option><option>Идут чистовые работы</option></select></label>
            <label className="field field--wide">Интересующие функции<textarea rows={3} value={state.functions} onChange={(event) => update({ functions: event.target.value })} /></label>
            <label className="field field--wide">Комментарий клиента<textarea rows={3} value={state.comment} onChange={(event) => update({ comment: event.target.value })} /></label>
          </div>}
          {state.step === 3 && <div className="application-review"><p><strong>Выбранные услуги:</strong> {calculatorServices.filter((service) => state.selectedServices.includes(service.id)).map((service) => service.name).join(', ') || 'не выбраны'}</p><p><strong>Объект:</strong> {state.objectType}, {state.area || '—'} м², комнат: {state.rooms}</p><p><strong>Наличие дизайн-проекта:</strong> {state.hasProject}</p><p><strong>Этап ремонта:</strong> {state.repairStage}</p>{state.functions && <p><strong>Интересующие функции:</strong> {state.functions}</p>}{state.comment && <p><strong>Комментарий клиента:</strong> {state.comment}</p>}</div>}
          <div className="calculator-actions">{state.step < 3 ? <button type="button" className="primary-button" onClick={nextStep}>Продолжить</button> : <button type="button" className="primary-button" onClick={submit} data-testid="submit-prototype">Отправить заявку</button>}</div>
        </section>
        <CalculatorSummary state={state} />
      </div>
    </main>
  )
}

function SuccessPage() {
  const navigate = useNavigate()
  const state = useMemo(loadCalculator, [])
  const smartSelected = state.selectedServices.includes('smart')
  return (
    <main className="page-width success-page">
      <div className="success-card">
        <span className="success-check">✓</span>
        <h1>{smartSelected ? 'Умный дом добавлен в заявку' : 'Заявка отправлена'}</h1>
        <p>{smartSelected ? 'Менеджер уточнит нужные комнаты и сценарии во время звонка. Точную комплектацию и стоимость подготовит исполнитель после знакомства с проектом.' : 'Менеджер свяжется с вами и уточнит детали.'}</p>
        <div className="button-row"><Link className="primary-button" to="/">На главную</Link><button type="button" className="secondary-button" onClick={() => navigate('/calculator')}>Изменить заявку</button></div>
      </div>
    </main>
  )
}

const flowSteps = [
  ['01', 'Консультационный звонок', 'Менеджер фиксирует факт выбора или отказа, площадь и количество комнат, интересующие функции, наличие дизайн-проекта, этап ремонта и комментарий клиента.'],
  ['02', 'Передача лида исполнителю', 'Исполнитель получает согласованные данные заявки.'],
  ['03', 'Проект и спецификация', 'Исполнитель готовит проект, состав оборудования и спецификацию.'],
  ['04', 'Монтаж, настройка и передача', 'Исполнитель монтирует устройства, настраивает сценарии, проверяет систему и передаёт её клиенту.'],
] as const

function FlowPage() {
  return <main className="page-width flow-page"><p className="service-appendix">Служебное приложение</p><h1>Клиентский путь после заявки</h1><div className="flow-grid">{flowSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{text}</p></article>)}</div></main>
}

function Footer() {
  return (
    <footer className="site-footer"><div className="page-width"><p><a href="https://remont.sberuslugi.ru/" target="_blank" rel="noreferrer">Полный список городов, где доступны услуги сервиса</a></p><p>*Согласно п.7.4 «Соглашения об использовании сервиса» компания ООО «РДВ-софт» не является участником правоотношений, устанавливаемых между Пользователями по поводу согласования и выполнения работ.</p><p>По всем вопросам пишите на нашу почту: <a href="mailto:request@sberuslugi.ru">request@sberuslugi.ru</a></p><div className="footer-links"><a href="https://remont.sberuslugi.ru/help/agreements" target="_blank" rel="noreferrer">Условия использования</a><a href="https://api-remont.sberuslugi.ru/api/public/document/politika-obrabotki-personalnyh-dannyh" target="_blank" rel="noreferrer">Политика обработки персональных данных</a></div><p>© 2026 Ремонт со СберУслугами | Сервис предоставляется ООО «РДВ-софт», ИНН 7709969870</p><p className="prototype-note">Интерактивный прототип. Данные не отправляются.</p></div></footer>
  )
}

function ScrollManager() {
  const location = useLocation()
  useEffect(() => {
    if (!location.search.includes('anchor=')) window.scrollTo(0, 0)
  }, [location.pathname, location.search])
  return null
}

function NotFound() {
  return <main className="page-width not-found"><h1>Страница не найдена</h1><Link className="primary-button" to="/">На главную</Link></main>
}

export default function App() {
  return <><ScrollManager /><Header /><Routes><Route path="/" element={<Home />} /><Route path="/help/services" element={<HelpPage />} /><Route path="/calculator" element={<CalculatorPage />} /><Route path="/success" element={<SuccessPage />} /><Route path="/flow" element={<FlowPage />} /><Route path="*" element={<NotFound />} /></Routes><Footer /></>
}
