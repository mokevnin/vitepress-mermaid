export interface MermaidMarkdownOptions {
  /** Fence language that marks a diagram. Default: `mermaid`. */
  lang?: string
  /** Name of the registered client component. Default: `Mermaid`. */
  component?: string
}

/**
 * The part of a markdown-it instance the plugin touches. Typed structurally so it
 * accepts markdown-it 14 (VitePress 1) and 15 without depending on either.
 */
export interface MarkdownItLike {
  renderer: {
    rules: {
      fence?: (tokens: any[], idx: number, options: any, env: any, self: any) => string
    }
  }
}

export declare function mermaidMarkdown(md: MarkdownItLike, options?: MermaidMarkdownOptions): void
