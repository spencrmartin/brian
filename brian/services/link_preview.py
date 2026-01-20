"""
Link preview service for fetching metadata from URLs
"""
import re
from typing import Optional, Dict
from urllib.parse import urlparse


def fetch_link_metadata(url: str) -> Dict[str, Optional[str]]:
    """
    Fetch metadata from a URL (title, description, image, etc.)
    
    Args:
        url: The URL to fetch metadata from
        
    Returns:
        Dictionary with metadata fields:
        - link_title: Page title or og:title
        - link_description: Meta description or og:description
        - link_image: og:image URL
        - link_site_name: og:site_name or domain
    """
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        # If dependencies not available, return basic metadata
        return _get_basic_metadata(url)
    
    try:
        # Set a reasonable timeout and user agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract metadata
        metadata = {
            'link_title': _extract_title(soup, url),
            'link_description': _extract_description(soup),
            'link_image': _extract_image(soup, url),
            'link_site_name': _extract_site_name(soup, url)
        }
        
        return metadata
        
    except Exception as e:
        # If fetching fails, return basic metadata
        print(f"Warning: Could not fetch metadata for {url}: {e}")
        return _get_basic_metadata(url)


def _get_basic_metadata(url: str) -> Dict[str, Optional[str]]:
    """Get basic metadata from URL without fetching"""
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path.split('/')[0]
    
    # Clean up domain
    if domain.startswith('www.'):
        domain = domain[4:]
    
    return {
        'link_title': None,
        'link_description': None,
        'link_image': None,
        'link_site_name': domain.title()
    }


def _extract_title(soup, url: str) -> Optional[str]:
    """Extract title from page"""
    # Try Open Graph title first
    og_title = soup.find('meta', property='og:title')
    if og_title and og_title.get('content'):
        return og_title['content'].strip()
    
    # Try Twitter title
    twitter_title = soup.find('meta', attrs={'name': 'twitter:title'})
    if twitter_title and twitter_title.get('content'):
        return twitter_title['content'].strip()
    
    # Fall back to <title> tag
    title_tag = soup.find('title')
    if title_tag and title_tag.string:
        return title_tag.string.strip()
    
    # Last resort: use URL path
    parsed = urlparse(url)
    path = parsed.path.strip('/').split('/')[-1]
    if path:
        # Clean up filename
        return path.replace('-', ' ').replace('_', ' ').title()
    
    return None


def _extract_description(soup) -> Optional[str]:
    """Extract description from page"""
    # Try Open Graph description
    og_desc = soup.find('meta', property='og:description')
    if og_desc and og_desc.get('content'):
        return og_desc['content'].strip()
    
    # Try Twitter description
    twitter_desc = soup.find('meta', attrs={'name': 'twitter:description'})
    if twitter_desc and twitter_desc.get('content'):
        return twitter_desc['content'].strip()
    
    # Try meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        return meta_desc['content'].strip()
    
    return None


def _extract_image(soup, url: str) -> Optional[str]:
    """Extract preview image from page"""
    # Try Open Graph image
    og_image = soup.find('meta', property='og:image')
    if og_image and og_image.get('content'):
        image_url = og_image['content']
        return _make_absolute_url(image_url, url)
    
    # Try Twitter image
    twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
    if twitter_image and twitter_image.get('content'):
        image_url = twitter_image['content']
        return _make_absolute_url(image_url, url)
    
    return None


def _extract_site_name(soup, url: str) -> Optional[str]:
    """Extract site name from page"""
    # Try Open Graph site name
    og_site = soup.find('meta', property='og:site_name')
    if og_site and og_site.get('content'):
        return og_site['content'].strip()
    
    # Fall back to domain
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path.split('/')[0]
    if domain.startswith('www.'):
        domain = domain[4:]
    
    return domain.title()


def _make_absolute_url(image_url: str, base_url: str) -> str:
    """Convert relative URL to absolute"""
    if image_url.startswith('http://') or image_url.startswith('https://'):
        return image_url
    
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    
    if image_url.startswith('//'):
        return f"{parsed.scheme}:{image_url}"
    elif image_url.startswith('/'):
        return f"{base}{image_url}"
    else:
        # Relative to current path
        path = parsed.path.rsplit('/', 1)[0]
        return f"{base}{path}/{image_url}"


def is_google_doc(url: str) -> bool:
    """Check if URL is a Google Doc"""
    return 'docs.google.com' in url


def extract_google_doc_title(url: str) -> Optional[str]:
    """
    Try to extract title from Google Docs URL
    Google Docs URLs don't provide good metadata without authentication
    """
    # Google Docs URLs have format: https://docs.google.com/document/d/{id}/edit
    # We can't fetch the actual title without auth, so return None
    # The user should provide a title when saving
    return None
