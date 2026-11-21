/**
 * markdown-it plugin: replaces mermaid code fences with the <Mermaid> component.
 * Other fences are rendered by the previous fence rule (VitePress highlighting stays intact).
 *
 * @param {import('./markdown.js').MarkdownItLike} md
 * @param {import('./markdown.js').MermaidMarkdownOptions} [options]
 */
export function mermaidMarkdown(md, options = {}) {
  const lang = options.lang ?? 'mermaid'
  const component = options.component ?? 'Mermaid'
  const fence = md.renderer.rules.fence

  /** @type {NonNullable<import('./markdown.js').MarkdownItLike['renderer']['rules']['fence']>} */
  const rule = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() === lang) {
      // encodeURIComponent keeps the source safe inside a Vue template attribute:
      // no quotes, no `{{ }}` interpolation, no HTML.
      return `<${component} code="${encodeURIComponent(token.content)}" />`
    }
    return fence ? fence(tokens, idx, opts, env, self) : self.renderToken(tokens, idx, opts)
  }
  md.renderer.rules.fence = rule
}
