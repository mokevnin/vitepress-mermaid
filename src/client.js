import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'

/** @type {import('mermaid').MermaidConfig} */
const defaultConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  themeVariables: {
    // The stock first series colour is nearly invisible on a light background.
    xyChart: { plotColorPalette: '#5672cd, #f08c00, #2f9e44, #c2255c', backgroundColor: 'transparent' },
    pie1: '#5672cd',
    pie2: '#f08c00',
    pie3: '#adb5bd',
    pie4: '#2f9e44',
  },
}

/** @type {import('mermaid').MermaidConfig} */
let userConfig = {}
let counter = 0

const isDark = () => document.documentElement.classList.contains('dark')

/**
 * Diagrams are drawn in the browser: mermaid needs the DOM, so SSR renders an empty container.
 * The component does not import `vitepress`, so it works without `ssr.noExternal`.
 */
export const Mermaid = defineComponent({
  name: 'Mermaid',
  props: {
    code: { type: String, required: true },
  },
  setup(props) {
    /** @type {import('vue').Ref<HTMLElement | null>} */
    const container = ref(null)
    /** @type {MutationObserver | undefined} */
    let observer
    let dark = false

    const render = async () => {
      const el = container.value
      if (!el) return
      const source = decodeURIComponent(props.code)
      const [{ default: mermaid }] = await Promise.all([import('mermaid'), document.fonts?.ready])
      dark = isDark()
      mermaid.initialize({
        ...defaultConfig,
        // mermaid measures labels with this font; a mismatch clips text.
        fontFamily: getComputedStyle(document.body).fontFamily,
        theme: dark ? 'dark' : 'default',
        ...userConfig,
        themeVariables: { ...defaultConfig.themeVariables, ...userConfig.themeVariables },
      })
      try {
        const { svg } = await mermaid.render(`mermaid-${++counter}`, source)
        el.innerHTML = svg
        el.removeAttribute('data-mermaid-error')
      } catch (error) {
        console.error('[vitepress-mermaid] failed to render diagram', error)
        el.setAttribute('data-mermaid-error', String(error))
        el.textContent = source
      }
    }

    onMounted(() => {
      render()
      // VitePress toggles the `dark` class on <html>; redraw with the matching theme.
      observer = new MutationObserver(() => {
        if (isDark() !== dark) render()
      })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    })
    onBeforeUnmount(() => observer?.disconnect())

    return () => h('div', { class: 'mermaid-diagram', ref: container })
  },
})

/**
 * Registers the <Mermaid> component. Call from `enhanceApp` of your theme.
 *
 * @param {import('vue').App} app
 * @param {import('mermaid').MermaidConfig} [config] merged over the defaults
 */
export function enhanceAppWithMermaid(app, config = {}) {
  userConfig = config
  app.component('Mermaid', Mermaid)
}
