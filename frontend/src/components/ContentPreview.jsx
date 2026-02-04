import React, { useMemo } from 'react'

/**
 * ContentPreview - Renders content with inline code highlighting for card previews
 * Lighter weight than MarkdownContent, optimized for preview contexts
 */
const ContentPreview = ({ content, maxLength = 200, className = '' }) => {
  const segments = useMemo(() => {
    if (!content) return []
    
    // Truncate content first
    let truncated = content
    if (content.length > maxLength) {
      truncated = content.slice(0, maxLength)
      // Try to end at a word boundary
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > maxLength * 0.7) {
        truncated = truncated.slice(0, lastSpace)
      }
      truncated += '...'
    }
    
    // Check if there's a code block that got cut off
    const codeBlockStart = truncated.lastIndexOf('```')
    const codeBlockEnd = truncated.indexOf('```', codeBlockStart + 3)
    if (codeBlockStart !== -1 && codeBlockEnd === -1) {
      // Code block was cut off, truncate before it
      truncated = truncated.slice(0, codeBlockStart).trim()
      if (truncated.length > 0) {
        truncated += '...'
      }
    }
    
    const result = []
    
    // Parse for inline code (backticks) and code blocks
    // Regex for inline code: `code` (not inside code blocks)
    const inlineCodeRegex = /`([^`\n]+)`/g
    
    // Check for code blocks first
    const hasCodeBlock = truncated.includes('```')
    
    if (hasCodeBlock) {
      // Simple handling: just show text before code block with indicator
      const beforeCode = truncated.split('```')[0].trim()
      if (beforeCode) {
        result.push({ type: 'text', content: beforeCode })
      }
      result.push({ type: 'code-indicator' })
    } else {
      // Parse inline code
      let lastIndex = 0
      let match
      
      while ((match = inlineCodeRegex.exec(truncated)) !== null) {
        // Add text before inline code
        if (match.index > lastIndex) {
          result.push({
            type: 'text',
            content: truncated.slice(lastIndex, match.index)
          })
        }
        
        // Add inline code
        result.push({
          type: 'inline-code',
          content: match[1]
        })
        
        lastIndex = match.index + match[0].length
      }
      
      // Add remaining text
      if (lastIndex < truncated.length) {
        result.push({
          type: 'text',
          content: truncated.slice(lastIndex)
        })
      }
    }
    
    // If nothing parsed, return original truncated text
    if (result.length === 0 && truncated) {
      result.push({ type: 'text', content: truncated })
    }
    
    return result
  }, [content, maxLength])
  
  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {segments.map((segment, i) => {
        if (segment.type === 'inline-code') {
          return (
            <code 
              key={i}
              className="px-1 py-0.5 rounded bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] text-xs font-mono"
            >
              {segment.content}
            </code>
          )
        }
        if (segment.type === 'code-indicator') {
          return (
            <span 
              key={i}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] text-xs font-mono text-muted-foreground ml-1"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              code
            </span>
          )
        }
        return <span key={i}>{segment.content}</span>
      })}
    </span>
  )
}

export default ContentPreview
