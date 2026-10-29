"""
Example task module demonstrating the tasks folder functionality
"""
from typing import Optional


def example_task(name: str, count: int = 1) -> str:
    """
    An example task that can be run from the tasks folder.
    
    Args:
        name: The name to greet
        count: Number of times to repeat the greeting
    
    Returns:
        A greeting message repeated count times
    """
    return f"Hello, {name}! " * count


class TaskRunner:
    """Example task runner class"""
    
    def __init__(self, prefix: str = "Task"):
        self.prefix = prefix
    
    def run(self, task_name: str) -> str:
        """Run a named task"""
        return f"{self.prefix}: {task_name} completed"


def process_items(items: list, filter_func: Optional[callable] = None) -> list:
    """
    Process a list of items with optional filtering.
    
    Args:
        items: List of items to process
        filter_func: Optional function to filter items
    
    Returns:
        Processed list of items
    """
    if filter_func:
        return [item for item in items if filter_func(item)]
    return items
