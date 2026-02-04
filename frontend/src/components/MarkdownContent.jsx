import React, { useMemo } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

// Language configuration for syntax highlighting
const LANGUAGE_CONFIG = {
  javascript: { name: 'JavaScript', color: '#f7df1e' },
  js: { name: 'JavaScript', color: '#f7df1e' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  ts: { name: 'TypeScript', color: '#3178c6' },
  python: { name: 'Python', color: '#3776ab' },
  py: { name: 'Python', color: '#3776ab' },
  rust: { name: 'Rust', color: '#dea584' },
  rs: { name: 'Rust', color: '#dea584' },
  go: { name: 'Go', color: '#00add8' },
  java: { name: 'Java', color: '#ed8b00' },
  cpp: { name: 'C++', color: '#00599c' },
  c: { name: 'C', color: '#a8b9cc' },
  csharp: { name: 'C#', color: '#239120' },
  cs: { name: 'C#', color: '#239120' },
  php: { name: 'PHP', color: '#777bb4' },
  ruby: { name: 'Ruby', color: '#cc342d' },
  rb: { name: 'Ruby', color: '#cc342d' },
  swift: { name: 'Swift', color: '#fa7343' },
  kotlin: { name: 'Kotlin', color: '#7f52ff' },
  kt: { name: 'Kotlin', color: '#7f52ff' },
  sql: { name: 'SQL', color: '#e38c00' },
  html: { name: 'HTML', color: '#e34f26' },
  css: { name: 'CSS', color: '#1572b6' },
  scss: { name: 'SCSS', color: '#c6538c' },
  json: { name: 'JSON', color: '#292929' },
  yaml: { name: 'YAML', color: '#cb171e' },
  yml: { name: 'YAML', color: '#cb171e' },
  markdown: { name: 'Markdown', color: '#083fa1' },
  md: { name: 'Markdown', color: '#083fa1' },
  bash: { name: 'Bash', color: '#4eaa25' },
  sh: { name: 'Shell', color: '#4eaa25' },
  shell: { name: 'Shell', color: '#4eaa25' },
  zsh: { name: 'Zsh', color: '#4eaa25' },
  powershell: { name: 'PowerShell', color: '#012456' },
  dockerfile: { name: 'Dockerfile', color: '#2496ed' },
  docker: { name: 'Docker', color: '#2496ed' },
  graphql: { name: 'GraphQL', color: '#e10098' },
  jsx: { name: 'JSX', color: '#61dafb' },
  tsx: { name: 'TSX', color: '#3178c6' },
  vue: { name: 'Vue', color: '#4fc08d' },
  svelte: { name: 'Svelte', color: '#ff3e00' },
  toml: { name: 'TOML', color: '#9c4121' },
  xml: { name: 'XML', color: '#0060ac' },
  lua: { name: 'Lua', color: '#000080' },
  r: { name: 'R', color: '#276dc3' },
  scala: { name: 'Scala', color: '#dc322f' },
  elixir: { name: 'Elixir', color: '#6e4a7e' },
  ex: { name: 'Elixir', color: '#6e4a7e' },
  haskell: { name: 'Haskell', color: '#5d4f85' },
  hs: { name: 'Haskell', color: '#5d4f85' },
  clojure: { name: 'Clojure', color: '#5881d8' },
  clj: { name: 'Clojure', color: '#5881d8' },
  erlang: { name: 'Erlang', color: '#a90533' },
  erl: { name: 'Erlang', color: '#a90533' },
  text: { name: 'Plain Text', color: '#6b7280' },
  plaintext: { name: 'Plain Text', color: '#6b7280' },
}

// Normalize language identifier
const normalizeLanguage = (lang) => {
  if (!lang) return 'text'
  const normalized = lang.toLowerCase().trim()
  return LANGUAGE_CONFIG[normalized] ? normalized : 'text'
}

// Get language display info
const getLanguageInfo = (lang) => {
  const normalized = normalizeLanguage(lang)
  return LANGUAGE_CONFIG[normalized] || LANGUAGE_CONFIG.text
}

// Inline code block component with syntax highlighting
const InlineCodeBlock = ({ code, language, isDark }) => {
  const langInfo = getLanguageInfo(language)
  const normalizedLang = normalizeLanguage(language)
  
  // Map to prism language names
  const prismLanguageMap = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rs: 'rust',
    rb: 'ruby',
    cs: 'csharp',
    kt: 'kotlin',
    sh: 'bash',
    zsh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
    docker: 'dockerfile',
    ex: 'elixir',
    hs: 'haskell',
    clj: 'clojure',
    erl: 'erlang',
    text: 'javascript', // fallback
    plaintext: 'javascript',
  }
  
  const prismLang = prismLanguageMap[normalizedLang] || normalizedLang
  const theme = isDark ? themes.vsDark : themes.vsLight
  
  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))]">
      {/* Header with language badge */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(var(--code-header-bg))] border-b border-[hsl(var(--code-border))]">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: langInfo.color }}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {langInfo.name}
          </span>
        </div>
      </div>
      
      {/* Code content */}
      <div className="overflow-x-auto">
        <Highlight theme={theme} code={code.trim()} language={prismLang}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre 
              className="p-3 text-sm leading-relaxed font-mono"
              style={{ 
                ...style, 
                margin: 0, 
                background: 'transparent',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="flex">
                  <span className="select-none pr-4 text-[hsl(var(--code-line-number))] text-right w-8 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}

// Inline code span (for `code` in text)
const InlineCode = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] text-sm font-mono text-[hsl(var(--foreground))]">
    {children}
  </code>
)

// Parse markdown content and render with code highlighting
const MarkdownContent = ({ content, className = '' }) => {
  // Detect dark mode
  const isDark = useMemo(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  }, [])
  
  // Parse content into segments
  const segments = useMemo(() => {
    if (!content) return []
    
    const result = []
    let remaining = content
    
    // Regex for fenced code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    
    let lastIndex = 0
    let match
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index)
        if (textBefore.trim()) {
          result.push({ type: 'text', content: textBefore })
        }
      }
      
      // Add the code block
      result.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text after last code block
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex)
      if (remaining.trim()) {
        result.push({ type: 'text', content: remaining })
      }
    }
    
    // If no code blocks found, return entire content as text
    if (result.length === 0 && content.trim()) {
      result.push({ type: 'text', content })
    }
    
    return result
  }, [content])
  
  // Render text with inline code spans
  const renderTextWithInlineCode = (text) => {
    // Regex for inline code: `code`
    const inlineCodeRegex = /`([^`]+)`/g
    const parts = []
    let lastIndex = 0
    let match
    
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        })
      }
      
      // Add inline code
      parts.push({
        type: 'inline-code',
        content: match[1]
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      })
    }
    
    if (parts.length === 0) {
      return text
    }
    
    return parts.map((part, i) => {
      if (part.type === 'inline-code') {
        return <InlineCode key={i}>{part.content}</InlineCode>
      }
      // Render text with line breaks preserved
      return <span key={i}>{part.content}</span>
    })
  }
  
  // Render paragraphs from text
  const renderText = (text) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/)
    
    return paragraphs.map((para, i) => {
      // Check for headers
      if (para.startsWith('# ')) {
        return (
          <h1 key={i} className="text-xl font-bold mb-2 mt-4 first:mt-0">
            {renderTextWithInlineCode(para.slice(2))}
          </h1>
        )
      }
      if (para.startsWith('## ')) {
        return (
          <h2 key={i} className="text-lg font-semibold mb-2 mt-3 first:mt-0">
            {renderTextWithInlineCode(para.slice(3))}
          </h2>
        )
      }
      if (para.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-semibold mb-1.5 mt-2 first:mt-0">
            {renderTextWithInlineCode(para.slice(4))}
          </h3>
        )
      }
      
      // Check for bullet lists
      const lines = para.split('\n')
      const isList = lines.every(line => 
        line.trim().startsWith('- ') || 
        line.trim().startsWith('* ') || 
        line.trim().match(/^\d+\.\s/) ||
        line.trim() === ''
      )
      
      if (isList && lines.some(l => l.trim())) {
        return (
          <ul key={i} className="list-disc list-inside mb-2 space-y-1">
            {lines.filter(l => l.trim()).map((line, j) => {
              const content = line.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')
              return (
                <li key={j} className="text-sm">
                  {renderTextWithInlineCode(content)}
                </li>
              )
            })}
          </ul>
        )
      }
      
      // Regular paragraph - preserve single line breaks
      const linesWithBreaks = para.split('\n')
      return (
        <p key={i} className="mb-2 last:mb-0 text-sm leading-relaxed">
          {linesWithBreaks.map((line, j) => (
            <React.Fragment key={j}>
              {renderTextWithInlineCode(line)}
              {j < linesWithBreaks.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      )
    })
  }
  
  return (
    <div className={`markdown-content ${className}`}>
      {segments.map((segment, i) => {
        if (segment.type === 'code') {
          return (
            <InlineCodeBlock 
              key={i}
              code={segment.content}
              language={segment.language}
              isDark={isDark}
            />
          )
        }
        return (
          <div key={i}>
            {renderText(segment.content)}
          </div>
        )
      })}
    </div>
  )
}

export default MarkdownContent
