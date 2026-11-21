import type { App, DefineComponent } from 'vue'
import type { MermaidConfig } from 'mermaid'

export declare const Mermaid: DefineComponent<{ code: string }>

export declare function enhanceAppWithMermaid(app: App, config?: MermaidConfig): void
