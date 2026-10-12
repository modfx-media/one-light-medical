import type { MarkdownNode } from '@/lib/markdown'

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: 'normal'
  style: string
  version: 1
}

function text(value: string, format = 0): LexicalTextNode {
  return {
    type: 'text',
    text: value,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function paragraph(value: string) {
  return {
    type: 'paragraph',
    children: value ? [text(value)] : [],
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

function heading(level: number, value: string) {
  const tag = `h${Math.min(6, Math.max(1, level))}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return {
    type: 'heading',
    tag,
    children: [text(value)],
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  }
}

function quote(value: string) {
  return {
    type: 'quote',
    children: [text(value)],
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  }
}

function list(ordered: boolean, items: string[]) {
  return {
    type: 'list',
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    children: items.map((item, index) => ({
      type: 'listitem',
      value: index + 1,
      children: [text(item)],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr' as const,
    format: '',
    indent: 0,
    version: 1,
  }
}

export function markdownNodesToLexical(nodes: MarkdownNode[]) {
  const children = nodes.map((node) => {
    if (node.kind === 'heading') return heading(node.level, node.text)
    if (node.kind === 'quote') return quote(node.text)
    if (node.kind === 'list') return list(node.ordered, node.items)
    if (node.kind === 'image') return paragraph(node.alt ? `[${node.alt}](${node.src})` : node.src)
    return paragraph(node.text)
  })

  return {
    root: {
      type: 'root',
      children: children.length > 0 ? children : [paragraph('')],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
