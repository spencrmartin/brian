import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(date)
}

export function stripMarkdown(text) {
  return text
    .replace(/[#*_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .trim()
}

export function truncate(text, length = 200) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function truncateText(text, length = 200) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function truncateTitle(title, maxLength = 60) {
  if (!title) return ''
  if (title.length <= maxLength) return title
  
  // Try to break at a word boundary
  const truncated = title.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

export function getItemTypeEmoji(type) {
  const emojiMap = {
    link: '🔗',
    note: '📝',
    code: '💻',
    paper: '📄',
    skill: '🧠'
  }
  return emojiMap[type] || '📄'
}

export function getItemTypeLabel(type) {
  const labelMap = {
    link: 'Link',
    note: 'Note',
    code: 'Code',
    paper: 'Paper',
    skill: 'Skill'
  }
  return labelMap[type] || 'Unknown'
}

export function getItemTypeColor(type) {
  const colorMap = {
    link: 'bg-blue-500',
    note: 'bg-green-500',
    code: 'bg-purple-500',
    paper: 'bg-orange-500',
    skill: 'bg-pink-500'
  }
  return colorMap[type] || 'bg-gray-500'
}
