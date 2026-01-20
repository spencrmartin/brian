# 🔗 Link Preview Feature

## Overview

Brian MCP now includes **automatic link metadata extraction** when you save links! When you provide a URL, Brian will:

- ✅ Fetch the page title (from `<title>` or `og:title`)
- ✅ Extract description (from meta description or `og:description`)
- ✅ Get preview image (from `og:image`)
- ✅ Identify site name (from `og:site_name` or domain)

## Current Status

⚠️ **Dependencies Not Installed Yet**

The link preview feature requires two packages:
- `requests` - For fetching web pages
- `beautifulsoup4` - For parsing HTML

## Installation

To enable link preview functionality, install the dependencies:

```bash
cd /Users/spencermartin/brian
source venv/bin/activate

# Try standard install
pip install requests beautifulsoup4

# If that fails due to hash verification, try:
pip install --no-deps requests beautifulsoup4
pip install charset-normalizer idna urllib3 certifi soupsieve
```

## How It Works

### Without Dependencies (Current State)
When you save a link without the dependencies installed:
```
Input: https://docs.google.com/document/d/abc123/edit
Result: 
  - Title: (as provided by user)
  - Content: (as provided by user)
  - Site Name: "Docs.Google.Com" (extracted from URL)
  - No preview image or description
```

### With Dependencies (After Installation)
When you save a link with dependencies installed:
```
Input: https://react.dev/blog/2023/03/22/react-labs
Result:
  - Title: "React Labs: What We've Been Working On – March 2023"
  - Description: "In React Labs posts, we write about projects in active research..."
  - Site Name: "React"
  - Preview Image: "https://react.dev/images/og-home.png"
```

## Usage

Once dependencies are installed, link preview works automatically:

```
You: "Save this link: https://react.dev"
Goose: [Fetches metadata automatically]
Goose: Saved "React - The library for web and native user interfaces"
      with description and preview image!
```

## Google Docs Limitation

**Note**: Google Docs links require authentication to fetch metadata. For Google Docs:
- The feature will extract the domain ("Google Docs")
- You should provide a descriptive title when saving
- The URL is still saved and accessible

Example:
```
You: "Save this Google Doc about React patterns: 
      https://docs.google.com/document/d/abc123/edit"
      
Goose: What title should I use for this document?
You: "React Component Patterns"
Goose: Saved! Title: "React Component Patterns"
```

## Testing

After installing dependencies, test the feature:

```bash
cd /Users/spencermartin/brian
source venv/bin/activate

python -c "
from brian.services.link_preview import fetch_link_metadata

# Test with a public URL
metadata = fetch_link_metadata('https://react.dev')
print('Title:', metadata['link_title'])
print('Description:', metadata['link_description'])
print('Site:', metadata['link_site_name'])
print('✅ Link preview working!')
"
```

## Fallback Behavior

The code is designed to work with or without dependencies:

1. **With dependencies**: Full metadata extraction
2. **Without dependencies**: Basic metadata from URL only
3. **If fetch fails**: Graceful fallback, link still saved

This means Brian MCP works immediately, and link preview is an enhancement!

## Benefits

### Better Organization
- Automatic titles from web pages
- Rich descriptions for context
- Preview images for visual recognition

### Time Saving
- No need to manually copy titles
- Descriptions extracted automatically
- Consistent metadata format

### Better Search
- More searchable content (titles + descriptions)
- Better context for similarity matching
- Richer full-text search results

## Future Enhancements

Potential improvements:
- Cache metadata to avoid re-fetching
- Support for more metadata types (author, publish date, etc.)
- PDF metadata extraction
- Video metadata (YouTube, Vimeo, etc.)
- Better Google Docs integration (with OAuth)

## Troubleshooting

### Dependencies Won't Install
If you encounter hash verification errors:
1. Check your pip version: `pip --version`
2. Try upgrading pip: `pip install --upgrade pip`
3. Use alternative install method (see Installation section)

### Metadata Not Fetching
If metadata isn't being extracted:
1. Check dependencies are installed: `pip list | grep -E "requests|beautifulsoup4"`
2. Check the URL is accessible (not behind auth)
3. Look for error messages in MCP server logs

### Google Docs Not Working
This is expected - Google Docs require authentication. Provide a title when saving.

## Status

- ✅ Code implemented
- ✅ Graceful fallback working
- ⏳ Dependencies need installation
- ✅ Ready to use once dependencies installed

**To enable full link preview: Install requests and beautifulsoup4 in the venv**

---

**Note**: Brian MCP works perfectly without this feature. Link preview is an optional enhancement that makes saving links more convenient!
