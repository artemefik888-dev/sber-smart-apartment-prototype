import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { track, trackImpression } from './analytics'
import {
  apartmentSolutions,
  calculatorServices,
  formatPrice,
  levels,
  readySets,
  rooms,
  solutionModules,
  type Level,
} from './data'

const CALCULATOR_KEY = 'sber-smart-apartment-calculator-v1'

function PrototypeBadge({ compact = false }: { compact?: boolean }) {
  return <span className={`prototype-badge${compact ? ' prototype-badge--compact' : ''}`}>Интерактивный прототип · демонстрационный макет</span>
}

function Header() {
  return (
    <header className="header">
      <div className="shell header__inner">
        <Link className="brand" to="/" aria-label="СберУслуги — на главную">
          <span className="brand__mark">✓</span><span>СБЕР УСЛУГИ</span><small className="header-demo">DEMO</small>
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <Link to="/">Ремонт</Link>
          <Link to="/help/services?section=smart-apartment">Помощь</Link>
          <Link className="nav__primary" to="/calculator">Рассчитать ремонт</Link>
        </nav>
      </div>
    </header>
  )
}

function Home() {
  useEffect(() => trackImpression('home_service_card'), [])

  return (
    <main>
      <section className="shell hero">
        <div className="hero__copy">
          <PrototypeBadge />
          <p className="eyebrow">Ремонт с комфортом</p>
          <h1>Дом, который понимает вас</h1>
          <p className="lead">Добавьте Умный дом Sber в проект ремонта — от сценариев освещения до защиты от протечек.</p>
          <div className="actions">
            <Link className="button" to="/help/services?section=smart-apartment">Посмотреть решения</Link>
            <Link className="button button--ghost" to="/calculator?smart=1&source=home-hero">Добавить к ремонту</Link>
          </div>
        </div>
        <div className="hero__visual">
          <img src="./assets/smart-home-hero.avif" alt="Интерьер с системой умного дома" />
          <div className="hero__caption"><span className="pulse" /> Умный дом Sber</div>
        </div>
      </section>

      <section className="shell section">
        <p className="eyebrow">Услуги для ремонта</p>
        <h2>Всё нужное — в одной заявке</h2>
        <div className="service-grid">
          <article className="service-card">
            <div className="service-card__art service-card__art--capital">К</div>
            <h3>Капитальный ремонт</h3>
            <p>Полный цикл работ от демонтажа до чистовой отделки.</p>
          </article>
          <article className="service-card service-card--smart" data-testid="home-smart-card">
            <div className="service-card__art"><img src="./assets/smart-lamp.avif" alt="Умная лампа Sber" /></div>
            <span className="pill">Новая услуга</span>
            <h3>Умная квартира Sber</h3>
            <p>Откройте для себя новый опыт жизни в квартире с Умным домом Sber. Он создаёт комфортную атмосферу и выполняет привычные действия по одной команде. Систему установят и настроят вместе с ремонтом.</p>
            <Link className="text-link" to="/help/services?section=smart-apartment">Подробнее <span>→</span></Link>
            <small>Доступно в Москве и Санкт-Петербурге</small>
          </article>
          <article className="service-card">
            <div className="service-card__art service-card__art--control">СК</div>
            <h3>Строительный контроль</h3>
            <p>Проверка качества и сроков выполнения работ.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

function RoomConfigurator() {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState(rooms[0].id)
  const [level, setLevel] = useState<Level>('Базовый')
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0]
  const variant = room.variants[level]

  useEffect(() => trackImpression('room_configurator'), [])

  return (
    <section id="rooms" className="detail-section" data-testid="room-configurator">
      <div className="section-heading">
        <div><p className="eyebrow">Решения по комнатам</p><h2>Соберите подходящий сценарий</h2></div>
        <span className="counter">6 комнат · 3 уровня</span>
      </div>
      <div className="room-tabs" role="tablist" aria-label="Комнаты">
        {rooms.map((item) => (
          <button key={item.id} className={roomId === item.id ? 'room-tab is-active' : 'room-tab'} onClick={() => setRoomId(item.id)} role="tab" aria-selected={roomId === item.id}>
            <span>{item.short}</span>{item.name}
          </button>
        ))}
      </div>
      <div className="level-tabs" aria-label="Уровень решения">
        {levels.map((item) => <button key={item} className={level === item ? 'is-active' : ''} onClick={() => setLevel(item)}>{item}</button>)}
      </div>
      <article className="room-result" key={`${roomId}-${level}`}>
        <div className="room-result__intro">
          <span className="pill pill--white">{room.name} · {level}</span>
          <h3>{variant.title}</h3>
          <p>{variant.benefit}</p>
          <div className="room-result__note"><span>i</span> Окончательный состав и стоимость специалист определит после консультации.</div>
          <button className="button" onClick={() => navigate(`/calculator?smart=1&source=room&room=${room.id}&level=${encodeURIComponent(level)}`)}>Добавить к ремонту</button>
        </div>
        <div className="room-result__details">
          <h4>Что умеет</h4>
          <ul className="check-list">{variant.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}</ul>
          <h4>Состав решения</h4>
          <div className="device-list">{variant.devices.map((device) => <span key={device}>{device}</span>)}</div>
          <details className="inline-details"><summary>Дополнительные возможности</summary><p>Сценарии можно уточнить вместе со специалистом: объединить комнаты, добавить голосовое управление, автоматику штор и совместимые устройства.</p></details>
        </div>
      </article>
    </section>
  )
}

function ReadySets() {
  const navigate = useNavigate()
  return (
    <section id="sets" className="detail-section">
      <div className="section-heading"><div><p className="eyebrow">Готовые наборы</p><h2>Начните с одного сценария</h2></div><p>Устройства, установка и настройка уточняются на консультации.</p></div>
      <div className="set-grid">
        {readySets.map((set) => (
          <article className={`set-card set-card--${set.accent}`} key={set.id}>
            <div className="set-card__icon" aria-hidden="true">{set.name.split(' ')[1]?.slice(0, 1) ?? 'У'}</div>
            <p className="set-card__price">{set.price}</p>
            <h3>{set.name}</h3>
            <p>{set.description}</p>
            <details onToggle={(event) => event.currentTarget.open && track('smart_apartment_expand', { placement: 'ready_set', set_id: set.id })}>
              <summary>Что входит</summary>
              <ul>{set.devices.map((device) => <li key={device}>{device}</li>)}</ul>
            </details>
            <button className="button button--dark" onClick={() => navigate(`/calculator?smart=1&source=ready-set&preset=${set.id}`)}>Выбрать набор</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function SolutionCard({ solution }: { solution: (typeof apartmentSolutions)[number] }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const total = solution.price + solutionModules.filter((module) => selected.includes(module.id)).reduce((sum, module) => sum + module.price, 0)

  return (
    <article className={`solution-card solution-card--${solution.id}`}>
      <div className="solution-card__top">
        <span className="solution-card__size">{solution.size}</span>
        <div><p>{solution.name}</p><h3>{formatPrice(solution.price)}</h3></div>
      </div>
      <details className="inline-details"><summary>Базовый состав</summary><div className="device-list">{solution.devices.map((device) => <span key={device}>{device}</span>)}</div></details>
      <div className="module-list">
        <h4>Добавить модули</h4>
        {solutionModules.map((module) => (
          <label key={module.id} className={selected.includes(module.id) ? 'module is-selected' : 'module'}>
            <input type="checkbox" checked={selected.includes(module.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, module.id] : current.filter((id) => id !== module.id))} />
            <span><strong>{module.name}</strong><small>+ {formatPrice(module.price)}</small></span>
            <details className="module__details"><summary aria-label={`Состав модуля ${module.name}`}>i</summary><p>{module.devices.join(', ')}</p></details>
          </label>
        ))}
      </div>
      <div className="solution-card__total"><span>Итого за оборудование</span><strong data-testid={`solution-total-${solution.id}`}>{formatPrice(total)}</strong><small>Монтаж и настройка — после консультации</small></div>
      <button className="button" onClick={() => navigate(`/calculator?smart=1&source=apartment-solution&preset=${solution.id}&modules=${selected.join(',')}`)}>Добавить решение</button>
    </article>
  )
}

function ApartmentSolutions() {
  return (
    <section id="apartments" className="detail-section">
      <div className="section-heading"><div><p className="eyebrow">Решения для квартиры</p><h2>Основа, которую можно расширить</h2></div><p>Выберите размер квартиры и отметьте дополнительные модули — сумма обновится сразу.</p></div>
      <div className="solution-grid">{apartmentSolutions.map((solution) => <SolutionCard key={solution.id} solution={solution} />)}</div>
    </section>
  )
}

function HelpPage() {
  const location = useLocation()
  const [open, setOpen] = useState(new URLSearchParams(location.search).get('section') === 'smart-apartment')
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (new URLSearchParams(location.search).get('section') !== 'smart-apartment') return
    setOpen(true)
    window.setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }, [location.search])

  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="shell help-page">
      <PrototypeBadge compact />
      <div className="help-layout">
        <aside className="help-menu" aria-label="Разделы помощи">
          <strong>Помощь</strong>
          <a href="#/help/services">Услуги</a><span>Заказ и оплата</span><span>Работа с исполнителем</span><span>Гарантии</span>
        </aside>
        <div className="help-content">
          <p className="eyebrow">Помощь пользователям</p><h1>Услуги для ремонта</h1>
          <div className="faq-list">
            <button className="faq-row"><span>Что входит в капитальный ремонт</span><i>⌄</i></button>
            <div id="smart-apartment" ref={sectionRef} className={open ? 'smart-accordion is-open' : 'smart-accordion'}>
              <button className="faq-row faq-row--smart" aria-expanded={open} onClick={() => { const next = !open; setOpen(next); if (next) track('smart_apartment_expand', { placement: 'help_accordion' }) }} data-testid="smart-accordion-trigger">
                <span><b>Новое</b> Что такое «Умная квартира Sber»</span><i>{open ? '×' : '+'}</i>
              </button>
              {open && <div className="smart-accordion__body">
                <div className="detail-hero">
                  <div><span className="partner-mark"><span className="brand__mark">✓</span> Умный дом Sber</span><h2>Комфорт и безопасность — уже в проекте ремонта</h2><p>Специалист подберёт устройства, предусмотрит электрику, установит оборудование и настроит сценарии вместе с ремонтом.</p><Link className="button" to="/calculator?smart=1&source=help-hero">Добавить услугу</Link></div>
                  <div className="detail-hero__orb"><span>18</span><small>вариантов<br />по комнатам</small></div>
                </div>
                <nav className="anchor-nav" aria-label="Содержание страницы">
                  <button onClick={() => jumpTo('benefits')}>Преимущества</button><button onClick={() => jumpTo('rooms')}>По комнатам</button><button onClick={() => jumpTo('sets')}>Наборы</button><button onClick={() => jumpTo('apartments')}>Вся квартира</button>
                </nav>
                <section id="benefits" className="detail-section detail-section--compact">
                  <div className="benefit-grid">
                    <article><span>01</span><h3>Вместе с ремонтом</h3><p>Электрика и места установки учитываются заранее.</p></article>
                    <article><span>02</span><h3>Одна команда</h3><p>Свет, климат и техника объединяются в сценарии.</p></article>
                    <article><span>03</span><h3>Безопасность</h3><p>Датчики вовремя сообщат о движении, открытии и воде.</p></article>
                    <article><span>04</span><h3>Под ключ</h3><p>Специалист установит, подключит и покажет, как всё работает.</p></article>
                  </div>
                </section>
                <RoomConfigurator />
                <ReadySets />
                <ApartmentSolutions />
                <section className="final-cta"><div><p className="eyebrow">Следующий шаг</p><h2>Обсудите будущую умную квартиру</h2><p>Добавьте услугу в расчёт ремонта. Специалист уточнит площадь, комнаты и нужные сценарии.</p></div><Link className="button" to="/calculator?smart=1&source=help-footer">Добавить к расчёту</Link></section>
              </div>}
            </div>
            <button className="faq-row"><span>Как работает строительный контроль</span><i>⌄</i></button>
            <button className="faq-row"><span>Какие материалы потребуются</span><i>⌄</i></button>
          </div>
        </div>
      </div>
    </main>
  )
}

type CalculatorState = {
  step: number
  selectedServices: string[]
  objectType: string
  area: string
  rooms: string
  city: string
  budget: string
  hasProject: string
  repairStage: string
  comment: string
  source: string
  preset: string
}

const defaultCalculator: CalculatorState = {
  step: 1, selectedServices: [], objectType: 'Квартира в новостройке', area: '55', rooms: '2', city: 'Москва', budget: 'До 3 000 000 ₽', hasProject: 'Нет', repairStage: 'Планирую ремонт', comment: '', source: '', preset: '',
}

function loadCalculator(): CalculatorState {
  try {
    const saved = localStorage.getItem(CALCULATOR_KEY)
    return saved ? { ...defaultCalculator, ...JSON.parse(saved) as Partial<CalculatorState> } : defaultCalculator
  } catch { return defaultCalculator }
}

function CalculatorSummary({ state }: { state: CalculatorState }) {
  const selected = calculatorServices.filter((service) => state.selectedServices.includes(service.id))
  return (
    <aside className="calculator-summary">
      <span className="step-badge">Шаг {state.step} из 3</span>
      <h3>Ваш расчёт</h3>
      {selected.length ? <ul>{selected.map((service) => <li key={service.id}>{service.name}{service.id === 'smart' && <span>Новое</span>}</li>)}</ul> : <p>Пока ничего не выбрано</p>}
      {state.step > 1 && <div className="summary-data"><span>{state.city}</span><span>{state.area} м² · {state.rooms} комн.</span></div>}
      <div className="summary-note"><strong>Стоимость рассчитает специалист</strong><p>После уточнения состава работ и консультации.</p></div>
    </aside>
  )
}

function CalculatorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<CalculatorState>(loadCalculator)
  const [expanded, setExpanded] = useState<string[]>([])
  const processedDeepLink = useRef(false)
  const allSelected = state.selectedServices.length === calculatorServices.length

  useEffect(() => { localStorage.setItem(CALCULATOR_KEY, JSON.stringify(state)) }, [state])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('smart') !== '1' || processedDeepLink.current) return
    processedDeepLink.current = true
    const source = params.get('source') ?? 'deep-link'
    const preset = params.get('preset') ?? params.get('room') ?? ''
    setState((current) => current.selectedServices.includes('smart')
      ? { ...current, step: 1, source, preset }
      : { ...current, step: 1, selectedServices: [...current.selectedServices, 'smart'], source, preset })
    track('smart_apartment_select', { placement: source, preset: preset || undefined })
    navigate('/calculator', { replace: true })
  }, [location.search, navigate])

  const update = (patch: Partial<CalculatorState>) => setState((current) => ({ ...current, ...patch }))
  const toggleExpanded = (id: string) => {
    setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    if (id === 'smart' && !expanded.includes(id)) track('smart_apartment_expand', { placement: 'calculator' })
  }
  const toggleService = (id: string) => {
    const selected = state.selectedServices.includes(id)
    update({ selectedServices: selected ? state.selectedServices.filter((item) => item !== id) : [...state.selectedServices, id] })
    if (id === 'smart') track(selected ? 'smart_apartment_deselect' : 'smart_apartment_select', { placement: 'calculator' })
  }
  const toggleAll = () => {
    const hadSmart = state.selectedServices.includes('smart')
    const next = allSelected ? [] : calculatorServices.map((service) => service.id)
    update({ selectedServices: next })
    if (hadSmart !== next.includes('smart')) track(next.includes('smart') ? 'smart_apartment_select' : 'smart_apartment_deselect', { placement: 'select_all' })
  }
  const goNext = () => {
    if (state.step === 1 && state.selectedServices.includes('smart')) track('smart_apartment_continue_selected', { selected_services: state.selectedServices })
    update({ step: Math.min(3, state.step + 1) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const submit = () => {
    const smartSelected = state.selectedServices.includes('smart')
    track('smart_apartment_submit', { smart_selected: smartSelected, city: state.city, rooms: state.rooms, area: state.area, source: state.source, preset: state.preset })
    track('smart_apartment_handoff_flag', { handoff_required: smartSelected, service_id: 'smart', source: state.source })
    navigate('/success')
  }

  return (
    <main className="calculator-page">
      <div className="shell"><PrototypeBadge compact /></div>
      <div className="shell calculator-layout">
        <section className="calculator-main">
          {state.step === 1 && <>
            <p className="eyebrow">Расчёт ремонта</p><h1>Какие услуги потребуются?</h1><p className="page-lead">Можно выбрать несколько услуг. Детали уточним перед началом работ.</p>
            <label className="select-all"><input type="checkbox" checked={allSelected} onChange={toggleAll} /> <span>Выбрать все услуги</span></label>
            <div className="calculator-services">
              {calculatorServices.map((service) => {
                const isExpanded = expanded.includes(service.id)
                const isSelected = state.selectedServices.includes(service.id)
                return <article key={service.id} className={`${isSelected ? 'calculator-service is-selected' : 'calculator-service'}${service.id === 'smart' ? ' calculator-service--smart' : ''}`} data-testid={service.id === 'smart' ? 'calculator-smart-service' : undefined}>
                  <button className="calculator-service__expand" aria-expanded={isExpanded} onClick={() => toggleExpanded(service.id)}><span>{service.id === 'smart' && <b>Новое</b>}{service.name}</span><i>{isExpanded ? '−' : '+'}</i></button>
                  <label className="check-control" aria-label={`${isSelected ? 'Убрать' : 'Выбрать'} услугу ${service.name}`}><input type="checkbox" checked={isSelected} onChange={() => toggleService(service.id)} /><span /></label>
                  {isExpanded && <div className="calculator-service__description"><p>{service.description}</p>{service.id === 'smart' && <Link className="text-link" to="/help/services?section=smart-apartment">Посмотреть варианты →</Link>}</div>}
                </article>
              })}
            </div>
          </>}
          {state.step === 2 && <>
            <p className="eyebrow">Объект</p><h1>Расскажите о квартире</h1><p className="page-lead">Эти данные помогут подобрать состав работ и умные сценарии.</p>
            <div className="form-grid">
              <label className="field field--wide"><span>Тип объекта</span><select value={state.objectType} onChange={(event) => update({ objectType: event.target.value })}><option>Квартира в новостройке</option><option>Квартира во вторичном доме</option><option>Апартаменты</option></select></label>
              <label className="field"><span>Площадь, м²</span><input type="number" min="10" max="500" value={state.area} onChange={(event) => update({ area: event.target.value })} /></label>
              <label className="field"><span>Количество комнат</span><select value={state.rooms} onChange={(event) => update({ rooms: event.target.value })}><option>Студия</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></label>
              <label className="field field--wide"><span>Город</span><select value={state.city} onChange={(event) => update({ city: event.target.value })}><option>Москва</option><option>Санкт-Петербург</option></select><small>Умная квартира доступна в этих двух городах</small></label>
            </div>
          </>}
          {state.step === 3 && <>
            <p className="eyebrow">Пожелания</p><h1>Последние детали</h1><p className="page-lead">Заявка демонстрационная: данные никуда не отправляются.</p>
            <div className="form-grid">
              <label className="field field--wide"><span>Бюджет ремонта</span><select value={state.budget} onChange={(event) => update({ budget: event.target.value })}><option>До 3 000 000 ₽</option><option>3 000 000–5 000 000 ₽</option><option>Более 5 000 000 ₽</option><option>Пока не определён</option></select></label>
              <label className="field"><span>Есть дизайн-проект?</span><select value={state.hasProject} onChange={(event) => update({ hasProject: event.target.value })}><option>Нет</option><option>Да</option><option>В процессе</option></select></label>
              <label className="field"><span>Стадия ремонта</span><select value={state.repairStage} onChange={(event) => update({ repairStage: event.target.value })}><option>Планирую ремонт</option><option>Идут черновые работы</option><option>Идут чистовые работы</option></select></label>
              <label className="field field--wide"><span>Какие сценарии важны?</span><textarea rows={5} placeholder="Например: тёплый свет вечером, защита от протечек, климат в детской" value={state.comment} onChange={(event) => update({ comment: event.target.value })} /></label>
            </div>
          </>}
          <div className="calculator-actions">
            {state.step > 1 && <button className="button button--ghost" onClick={() => update({ step: state.step - 1 })}>Назад</button>}
            {state.step < 3 ? <button className="button" onClick={goNext}>Продолжить</button> : <button className="button" onClick={submit} data-testid="submit-prototype">Отправить демонстрационную заявку</button>}
          </div>
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
    <main className="shell success-page">
      <PrototypeBadge />
      <div className="success-card">
        <div className="success-check">✓</div>
        <p className="eyebrow">Готово</p>
        <h1>{smartSelected ? 'Умная квартира добавлена в заявку' : 'Заявка на ремонт собрана'}</h1>
        <p>В реальном сервисе специалист связался бы с вами, уточнил состав работ и подготовил индивидуальный расчёт.</p>
        {smartSelected && <div className="success-selection"><strong>Умная квартира Sber</strong><span>{state.city} · {state.area} м² · {state.rooms} комн.</span>{state.preset && <small>Выбранный вариант: {state.preset}</small>}</div>}
        <div className="actions"><Link className="button" to="/">Вернуться на главную</Link><button className="button button--ghost" onClick={() => navigate('/calculator')}>Изменить расчёт</button></div>
      </div>
    </main>
  )
}

const flowSteps = [
  { number: '01', title: 'Консультация', text: 'Специалист уточняет задачи, площадь, комнаты, бюджет и желаемые сценарии.', meta: ['город', 'тип объекта', 'площадь', 'комнаты', 'стадия ремонта'] },
  { number: '02', title: 'Передача лида', text: 'При выбранной услуге заявка получает флаг «Умная квартира» и передаётся профильному исполнителю.', meta: ['service_id: smart', 'source / preset', 'handoff_required: true'] },
  { number: '03', title: 'Проект и спецификация', text: 'Исполнитель согласует сценарии, устройства, точки питания, монтаж и финальную стоимость.', meta: ['сценарии', 'состав устройств', 'проект электрики', 'смета'] },
  { number: '04', title: 'Установка и передача', text: 'Оборудование монтируют, подключают, настраивают и показывают клиенту готовые сценарии.', meta: ['монтаж', 'настройка', 'проверка', 'инструктаж клиента'] },
]

function FlowPage() {
  return (
    <main className="shell flow-page">
      <PrototypeBadge />
      <p className="eyebrow">Служебная схема</p><h1>Что происходит после заявки</h1><p className="page-lead">Экран нужен для демонстрации целевого процесса и не включён в клиентскую навигацию.</p>
      <div className="flow-grid">{flowSteps.map((step) => <article key={step.number}><span>{step.number}</span><h2>{step.title}</h2><p>{step.text}</p><div>{step.meta.map((item) => <code key={item}>{item}</code>)}</div></article>)}</div>
      <div className="handoff-map"><div><strong>Данные для передачи</strong><p>Выбор услуги · источник перехода · набор или комната · город · площадь · комнаты · стадия ремонта · бюджет · наличие дизайн‑проекта · комментарий клиента.</p></div><span>→</span><div><strong>Профильный исполнитель</strong><p>Получает контекст, готовит консультацию, спецификацию и расчёт.</p></div></div>
    </main>
  )
}

function NotFound() {
  return <main className="shell not-found"><PrototypeBadge /><h1>Такого экрана нет</h1><p>Вернитесь на главную страницу прототипа.</p><Link className="button" to="/">На главную</Link></main>
}

function Footer() {
  return <footer><div className="shell footer-inner"><div><strong>СберУслуги × Умный дом Sber</strong><p>Демонстрационный макет · не является публичной офертой</p></div><div><a href="https://sberdevices.ru/smarthome/" target="_blank" rel="noreferrer">Об Умном доме Sber ↗</a><a href="https://sberdevices.ru/shop/category/smarthome/" target="_blank" rel="noreferrer">Каталог устройств ↗</a></div></div></footer>
}

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname, location.search])
  return null
}

export default function App() {
  return <><ScrollToTop /><Header /><Routes><Route path="/" element={<Home />} /><Route path="/help/services" element={<HelpPage />} /><Route path="/calculator" element={<CalculatorPage />} /><Route path="/success" element={<SuccessPage />} /><Route path="/flow" element={<FlowPage />} /><Route path="*" element={<NotFound />} /></Routes><Footer /></>
}
