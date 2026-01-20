import { ExternalLink, Globe } from 'lucide-react'

/**
 * LinkPreview - iPhone-style rich link preview card
 * Displays link metadata with image, title, description, and site name
 */
export default function LinkPreview({ item }) {
  const {
    url,
    link_title,
    link_description,
    link_image,
    link_site_name,
    title
  } = item

  // Extract domain from URL for fallback
  const getDomain = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const displayTitle = link_title || title
  const displaySiteName = link_site_name || getDomain(url)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="overflow-hidden hover:bg-gray-50 transition-colors">
        {/* Image */}
        {link_image && (
          <div className="w-full aspect-[2/1] bg-muted overflow-hidden">
            <img
              src={link_image}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3 space-y-1">
          {/* Site name / Domain */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span className="font-medium uppercase tracking-wide">
              {displaySiteName}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>

          {/* Description */}
          {link_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {link_description}
            </p>
          )}

          {/* URL indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{getDomain(url)}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
