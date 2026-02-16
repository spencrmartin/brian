"""
Skills Importer - Fetch and import skills from Anthropic's skills repository
"""
import json
import re
from typing import Optional, List, Dict, Any
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

# GitHub API configuration
GITHUB_API_BASE = "https://api.github.com"
GITHUB_RAW_BASE = "https://raw.githubusercontent.com"
SKILLS_REPO = "anthropics/skills"
SKILLS_REPO_BRANCH = "main"
SKILLS_PATH = "skills"


class SkillImportError(Exception):
    """Exception raised when skill import fails"""
    pass


def parse_yaml_frontmatter(content: str) -> tuple[Dict[str, Any], str]:
    """
    Parse YAML frontmatter from markdown content.
    
    Returns:
        Tuple of (frontmatter_dict, markdown_body)
    """
    # Match YAML frontmatter between --- delimiters
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, content, re.DOTALL)
    
    if not match:
        return {}, content
    
    yaml_content = match.group(1)
    markdown_body = match.group(2)
    
    # Simple YAML parser for frontmatter (key: value pairs)
    frontmatter = {}
    for line in yaml_content.split('\n'):
        line = line.strip()
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            # Remove quotes if present
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]
            frontmatter[key] = value
    
    return frontmatter, markdown_body


def fetch_github_api(endpoint: str, github_token: Optional[str] = None) -> Any:
    """
    Fetch data from GitHub API.
    
    Args:
        endpoint: API endpoint (e.g., "/repos/anthropics/skills/contents/skills")
        github_token: Optional GitHub personal access token for higher rate limits
    
    Returns:
        Parsed JSON response
    
    Raises:
        SkillImportError: If request fails
    """
    url = f"{GITHUB_API_BASE}{endpoint}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Brian-Skills-Importer/1.0"
    }
    
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except HTTPError as e:
        if e.code == 403:
            # Check if it's a rate limit error
            raise SkillImportError(
                f"GitHub API rate limit exceeded. "
                f"Provide a GitHub token for higher limits (5000/hour vs 60/hour). "
                f"Error: {e}"
            )
        raise SkillImportError(f"GitHub API request failed: {e}")
    except URLError as e:
        raise SkillImportError(f"Network error: {e}")
    except json.JSONDecodeError as e:
        raise SkillImportError(f"Failed to parse GitHub API response: {e}")


def fetch_raw_file(repo: str, branch: str, path: str) -> str:
    """
    Fetch raw file content from GitHub.
    
    Args:
        repo: Repository in format "owner/repo"
        branch: Branch name
        path: File path in repository
    
    Returns:
        File content as string
    
    Raises:
        SkillImportError: If request fails
    """
    url = f"{GITHUB_RAW_BASE}/{repo}/{branch}/{path}"
    
    try:
        req = Request(url, headers={"User-Agent": "Brian-Skills-Importer/1.0"})
        with urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except HTTPError as e:
        raise SkillImportError(f"Failed to fetch {path}: {e}")
    except URLError as e:
        raise SkillImportError(f"Network error fetching {path}: {e}")


def list_available_skills(github_token: Optional[str] = None) -> List[Dict[str, str]]:
    """
    List all available skills in the Anthropic skills repository.
    
    Args:
        github_token: Optional GitHub token for higher rate limits
    
    Returns:
        List of skill dictionaries with 'name', 'path', 'url' keys
    
    Raises:
        SkillImportError: If listing fails
    """
    endpoint = f"/repos/{SKILLS_REPO}/contents/{SKILLS_PATH}"
    
    try:
        contents = fetch_github_api(endpoint, github_token)
        
        skills = []
        for item in contents:
            if item['type'] == 'dir':
                skills.append({
                    'name': item['name'],
                    'path': item['path'],
                    'url': item['html_url'],
                })
        
        return skills
    except SkillImportError:
        raise
    except Exception as e:
        raise SkillImportError(f"Failed to list skills: {e}")


def fetch_skill(skill_name: str, github_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch a skill from the Anthropic skills repository.
    
    Args:
        skill_name: Name of the skill (e.g., "algorithmic-art")
        github_token: Optional GitHub token for higher rate limits
    
    Returns:
        Dictionary with skill data:
        {
            'name': str,
            'frontmatter': dict,  # YAML frontmatter
            'content': str,       # Markdown body
            'source_url': str,    # GitHub URL
            'bundled_resources': dict  # {type: [filenames]}
        }
    
    Raises:
        SkillImportError: If fetch fails
    """
    skill_path = f"{SKILLS_PATH}/{skill_name}"
    
    # Fetch SKILL.md
    try:
        skill_md_path = f"{skill_path}/SKILL.md"
        skill_content = fetch_raw_file(SKILLS_REPO, SKILLS_REPO_BRANCH, skill_md_path)
        
        # Parse YAML frontmatter and markdown body
        frontmatter, markdown_body = parse_yaml_frontmatter(skill_content)
        
        # Fetch directory structure to find bundled resources
        endpoint = f"/repos/{SKILLS_REPO}/contents/{skill_path}"
        contents = fetch_github_api(endpoint, github_token)
        
        bundled_resources = {
            'scripts': [],
            'references': [],
            'assets': []
        }
        
        for item in contents:
            if item['type'] == 'dir' and item['name'] in bundled_resources:
                # List files in this resource directory
                resource_endpoint = f"/repos/{SKILLS_REPO}/contents/{item['path']}"
                resource_contents = fetch_github_api(resource_endpoint, github_token)
                
                for resource_file in resource_contents:
                    if resource_file['type'] == 'file':
                        bundled_resources[item['name']].append({
                            'name': resource_file['name'],
                            'path': resource_file['path'],
                            'url': resource_file['html_url'],
                            'download_url': resource_file.get('download_url'),
                        })
        
        return {
            'name': skill_name,
            'frontmatter': frontmatter,
            'content': markdown_body,
            'source_url': f"https://github.com/{SKILLS_REPO}/tree/{SKILLS_REPO_BRANCH}/{skill_path}",
            'bundled_resources': bundled_resources,
        }
        
    except SkillImportError:
        raise
    except Exception as e:
        raise SkillImportError(f"Failed to fetch skill '{skill_name}': {e}")


def fetch_skill_resource(resource_path: str) -> str:
    """
    Fetch content of a bundled resource file.
    
    Args:
        resource_path: Path to resource file in repository
    
    Returns:
        Resource file content
    
    Raises:
        SkillImportError: If fetch fails
    """
    try:
        return fetch_raw_file(SKILLS_REPO, SKILLS_REPO_BRANCH, resource_path)
    except SkillImportError:
        raise
    except Exception as e:
        raise SkillImportError(f"Failed to fetch resource '{resource_path}': {e}")


def skill_to_knowledge_item(skill_data: Dict[str, Any], project_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Convert skill data to knowledge item format.
    
    Args:
        skill_data: Skill data from fetch_skill()
        project_id: Optional project ID to assign the skill to
    
    Returns:
        Dictionary in KnowledgeItem format ready for database insertion
    """
    from brian.models.knowledge_item import ItemType
    
    # Extract frontmatter fields
    frontmatter = skill_data['frontmatter']
    skill_name = frontmatter.get('name', skill_data['name'])
    description = frontmatter.get('description', '')
    license_info = frontmatter.get('license', '')
    
    # Build skill metadata
    skill_metadata = {
        'name': skill_name,
        'description': description,
        'license': license_info,
        'source_url': skill_data['source_url'],
        'source_commit': None,  # TODO: Fetch actual commit SHA
        'bundled_resources': skill_data['bundled_resources'],
    }
    
    # Create knowledge item
    return {
        'title': f"Skill: {skill_name}",
        'content': skill_data['content'],
        'item_type': ItemType.SKILL.value,
        'url': skill_data['source_url'],
        'skill_metadata': skill_metadata,
        'project_id': project_id,
        'tags': ['skill', 'anthropic'],
    }
