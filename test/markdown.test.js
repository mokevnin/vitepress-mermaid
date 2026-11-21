import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { mermaidMarkdown } from '../src/markdown.js'

const source = 'flowchart TD\n    A["Start {{ x }}"] --> B\n'

test('mermaid fence becomes an encoded component', () => {
  const md = new MarkdownIt().use(mermaidMarkdown)
  const html = md.render('```mermaid\n' + source + '```\n')
  assert.equal(html, `<Mermaid code="${encodeURIComponent(source)}" />`)
  assert.ok(!html.includes('{{'), 'no Vue interpolation leaks into the template')
})

test('other fences use the previous renderer', () => {
  const md = new MarkdownIt().use(mermaidMarkdown)
  assert.equal(md.render('```js\nlet a = 1\n```\n'), new MarkdownIt().render('```js\nlet a = 1\n```\n'))
})

test('custom language and component name', () => {
  const md = new MarkdownIt().use(mermaidMarkdown, { lang: 'diagram', component: 'Diagram' })
  assert.equal(md.render('```diagram\nA\n```\n'), `<Diagram code="${encodeURIComponent('A\n')}" />`)
  assert.match(md.render('```mermaid\nA\n```\n'), /<pre><code class="language-mermaid">/)
})
