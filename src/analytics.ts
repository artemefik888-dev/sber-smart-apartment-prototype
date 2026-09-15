export type SmartEvent =
  | 'smart_apartment_impression'
  | 'smart_apartment_expand'
  | 'smart_apartment_select'
  | 'smart_apartment_deselect'
  | 'smart_apartment_continue_selected'
  | 'smart_apartment_submit'
  | 'smart_apartment_handoff_flag'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const sentImpressions = new Set<string>()

export function track(event: SmartEvent, payload: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? []
  const record = { event, prototype: true, timestamp: new Date().toISOString(), ...payload }
  window.dataLayer.push(record)
  console.info('[prototype analytics]', record)
}

export function trackImpression(placement: string) {
  if (sentImpressions.has(placement)) return
  sentImpressions.add(placement)
  track('smart_apartment_impression', { placement })
}
