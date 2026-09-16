"""
Knowledge decay service for Brian

Computes decay scores for knowledge items based on:
- Time decay: items lose relevance as they age
- Access frequency: frequently accessed items maintain higher relevance
- Linking weight: items with more connections maintain higher relevance

The decay score can be used to:
- Filter out stale knowledge from search results
- Adjust similarity scores based on freshness
- Identify knowledge that needs review
"""
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import math


class KnowledgeDecayService:
    """
    Service for computing knowledge decay scores
    
    Decay score ranges from 0.0 (completely decayed/stale) to 1.0 (fresh/relevant)
    """
    
    # Default parameters
    DEFAULT_TIME_DECAY_HALF_LIFE = 30  # days for time decay half-life
    DEFAULT_ACCESS_BOOST_FACTOR = 0.5  # How much access frequency boosts score
    DEFAULT_LINKING_BOOST_FACTOR = 0.3  # How much connections boost score
    DEFAULT_MIN_DECAY = 0.1  # Minimum decay score (never completely zero)
    DEFAULT_MAX_DECAY = 1.0  # Maximum decay score
    
    def __init__(
        self,
        time_decay_half_life: float = DEFAULT_TIME_DECAY_HALF_LIFE,
        access_boost_factor: float = DEFAULT_ACCESS_BOOST_FACTOR,
        linking_boost_factor: float = DEFAULT_LINKING_BOOST_FACTOR,
        min_decay: float = DEFAULT_MIN_DECAY,
        max_decay: float = DEFAULT_MAX_DECAY
    ):
        """
        Initialize the decay service
        
        Args:
            time_decay_half_life: Days for time-based decay half-life
                                (higher = slower decay)
            access_boost_factor: Weight for access frequency in decay calculation
                                (0-1, higher = more impact from access count)
            linking_boost_factor: Weight for connection count in decay calculation
                                (0-1, higher = more impact from linking weight)
            min_decay: Minimum decay score (prevents complete decay)
            max_decay: Maximum decay score
        """
        self.time_decay_half_life = time_decay_half_life
        self.access_boost_factor = access_boost_factor
        self.linking_boost_factor = linking_boost_factor
        self.min_decay = min_decay
        self.max_decay = max_decay
    
    def compute_time_decay(self, created_at: datetime, updated_at: Optional[datetime] = None) -> float:
        """
        Compute time-based decay factor
        
        Uses exponential decay: decay = 0.5^(days / half_life)
        
        Args:
            created_at: When the item was created
            updated_at: When the item was last updated (uses created_at if None)
            
        Returns:
            Time decay factor (0.0 to 1.0)
        """
        # Use updated_at if available, otherwise created_at
        reference_date = updated_at if updated_at else created_at
        
        # Calculate days since reference date
        now = datetime.now(reference_date.tzinfo if reference_date.tzinfo else None)
        days_old = (now - reference_date).total_seconds() / 86400  # 86400 seconds in a day
        
        # Exponential decay: half-life based
        # decay = 0.5^(days / half_life)
        time_decay = 0.5 ** (days_old / self.time_decay_half_life)
        
        return max(self.min_decay, min(self.max_decay, time_decay))
    
    def compute_access_boost(self, access_count: int, total_accesses: Optional[int] = None) -> float:
        """
        Compute access frequency boost
        
        Args:
            access_count: How many times this item has been accessed
            total_accesses: Total accesses across all items (for normalization)
            
        Returns:
            Access boost factor (0.0 to 1.0)
        """
        if access_count <= 0:
            return 0.0
        
        # If we have total accesses, normalize by it
        if total_accesses and total_accesses > 0:
            # Normalize access count to 0-1 range
            normalized = min(1.0, access_count / total_accesses)
        else:
            # Without normalization, use logarithmic scaling
            # This prevents a few highly-accessed items from dominating
            normalized = min(1.0, math.log1p(access_count) / 10)  # log1p to handle 0
        
        # Apply boost factor
        return normalized * self.access_boost_factor
    
    def compute_linking_boost(self, connection_count: int, max_connections: Optional[int] = None) -> float:
        """
        Compute linking weight boost
        
        Args:
            connection_count: How many connections this item has
            max_connections: Maximum connections any item has (for normalization)
            
        Returns:
            Linking boost factor (0.0 to 1.0)
        """
        if connection_count <= 0:
            return 0.0
        
        # If we have max connections, normalize
        if max_connections and max_connections > 0:
            normalized = min(1.0, connection_count / max_connections)
        else:
            # Without normalization, use logarithmic scaling
            normalized = min(1.0, math.log1p(connection_count) / 5)
        
        # Apply boost factor
        return normalized * self.linking_boost_factor
    
    def compute_decay_score(
        self,
        item: Dict,
        total_accesses: Optional[int] = None,
        max_connections: Optional[int] = None
    ) -> float:
        """
        Compute overall decay score for an item
        
        Combines time decay, access boost, and linking boost into a single score.
        
        Args:
            item: Knowledge item dictionary with:
                - created_at: When the item was created
                - updated_at: When the item was last updated (optional)
                - accessed_at: When the item was last accessed (optional)
                - access_count: How many times accessed (optional, defaults to 0)
                - connection_count: How many connections (optional, defaults to 0)
            total_accesses: Total accesses across all items (for normalization)
            max_connections: Maximum connections any item has (for normalization)
            
        Returns:
            Overall decay score (0.0 to 1.0)
        """
        # Parse dates
        created_at = self._parse_date(item.get('created_at'))
        updated_at = self._parse_date(item.get('updated_at'))
        accessed_at = self._parse_date(item.get('accessed_at'))
        
        # Use most recent of updated_at or accessed_at as reference
        reference_dates = [d for d in [updated_at, accessed_at] if d is not None]
        reference_date = max(reference_dates) if reference_dates else created_at
        
        # Get access count
        access_count = item.get('access_count', item.get('vote_count', 0))
        
        # Get connection count
        connection_count = item.get('connection_count', 0)
        
        # Compute components
        time_decay = self.compute_time_decay(created_at, reference_date)
        access_boost = self.compute_access_boost(access_count, total_accesses)
        linking_boost = self.compute_linking_boost(connection_count, max_connections)
        
        # Combine: weighted sum, then clamp to [0, 1]
        # Time decay is the base, boosts add to it
        combined = time_decay + access_boost + linking_boost
        
        # Normalize and clamp
        decay_score = max(self.min_decay, min(self.max_decay, combined))
        
        return decay_score
    
    def compute_decay_scores(
        self,
        items: List[Dict],
        connections: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Compute decay scores for multiple items
        
        Args:
            items: List of knowledge item dictionaries
            connections: Optional list of connection dictionaries for linking boost
            
        Returns:
            List of items with added decay_score field
        """
        if not items:
            return []
        
        # Calculate total accesses and max connections for normalization
        total_accesses = sum(item.get('access_count', item.get('vote_count', 0)) for item in items)
        
        # Build connection counts if connections provided
        connection_counts = {}
        if connections:
            for conn in connections:
                source = conn.get('source_item_id')
                target = conn.get('target_item_id')
                
                if source:
                    connection_counts[source] = connection_counts.get(source, 0) + 1
                if target:
                    connection_counts[target] = connection_counts.get(target, 0) + 1
        
        max_connections = max(connection_counts.values()) if connection_counts else None
        
        # Compute decay scores
        scored_items = []
        for item in items:
            item_id = item.get('id')
            item_copy = dict(item)
            item_copy['connection_count'] = connection_counts.get(item_id, 0)
            
            decay_score = self.compute_decay_score(
                item_copy,
                total_accesses=total_accesses,
                max_connections=max_connections
            )
            
            item_copy['decay_score'] = round(decay_score, 4)
            scored_items.append(item_copy)
        
        return scored_items
    
    def filter_by_decay(
        self,
        items: List[Dict],
        min_decay: float = 0.3,
        connections: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Filter items by minimum decay score
        
        Args:
            items: List of knowledge item dictionaries
            min_decay: Minimum decay score threshold (0.0 to 1.0)
            connections: Optional list of connection dictionaries
            
        Returns:
            Filtered list of items with decay_score >= min_decay
        """
        scored_items = self.compute_decay_scores(items, connections)
        return [item for item in scored_items if item.get('decay_score', 0) >= min_decay]
    
    def sort_by_decay(
        self,
        items: List[Dict],
        reverse: bool = False,
        connections: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Sort items by decay score
        
        Args:
            items: List of knowledge item dictionaries
            reverse: If True, sort descending (highest decay first)
            connections: Optional list of connection dictionaries
            
        Returns:
            Sorted list of items with decay_score field
        """
        scored_items = self.compute_decay_scores(items, connections)
        return sorted(scored_items, key=lambda x: x.get('decay_score', 0), reverse=reverse)
    
    def get_stale_items(
        self,
        items: List[Dict],
        max_decay: float = 0.3,
        connections: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Get items that are stale (low decay score)
        
        Useful for identifying knowledge that needs review/refresh.
        
        Args:
            items: List of knowledge item dictionaries
            max_decay: Maximum decay score to be considered stale
            connections: Optional list of connection dictionaries
            
        Returns:
            List of stale items with decay_score <= max_decay
        """
        scored_items = self.compute_decay_scores(items, connections)
        return [item for item in scored_items if item.get('decay_score', 1) <= max_decay]
    
    def decay_adjusted_similarity(
        self,
        similarity_score: float,
        decay_score: float,
        decay_weight: float = 0.5
    ) -> float:
        """
        Adjust a similarity score based on decay
        
        Combines content similarity with knowledge freshness.
        
        Args:
            similarity_score: Original similarity score (0.0 to 1.0)
            decay_score: Decay score for the item (0.0 to 1.0)
            decay_weight: How much decay affects the similarity (0.0 to 1.0)
                        0.0 = decay doesn't affect similarity
                        1.0 = similarity is multiplied by decay
            
        Returns:
            Adjusted similarity score
        """
        # Weighted combination: similarity * (decay_weight * decay + (1 - decay_weight))
        adjusted = similarity_score * (decay_weight * decay_score + (1 - decay_weight))
        return max(0.0, min(1.0, adjusted))
    
    def _parse_date(self, date_value: Optional[str]) -> Optional[datetime]:
        """Parse a date string into datetime"""
        if date_value is None:
            return None
        
        if isinstance(date_value, datetime):
            return date_value
        
        try:
            return datetime.fromisoformat(date_value.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None
    
    def get_decay_analysis(self, items: List[Dict], connections: Optional[List[Dict]] = None) -> Dict:
        """
        Get comprehensive decay analysis for a knowledge base
        
        Args:
            items: List of knowledge item dictionaries
            connections: Optional list of connection dictionaries
            
        Returns:
            Dictionary with decay statistics and insights
        """
        if not items:
            return {
                "total_items": 0,
                "average_decay": 0,
                "fresh_items": 0,
                "stale_items": 0,
                "needs_review": []
            }
        
        scored_items = self.compute_decay_scores(items, connections)
        decay_scores = [item.get('decay_score', 0) for item in scored_items]
        
        # Sort by decay score ascending (stale first)
        sorted_items = sorted(scored_items, key=lambda x: x.get('decay_score', 0))
        
        # Calculate statistics
        avg_decay = sum(decay_scores) / len(decay_scores) if decay_scores else 0
        
        # Count fresh vs stale
        fresh_count = sum(1 for score in decay_scores if score >= 0.5)
        stale_count = sum(1 for score in decay_scores if score < 0.3)
        
        # Get items that need review (lowest decay scores)
        needs_review = sorted_items[:min(10, len(sorted_items))]
        
        return {
            "total_items": len(items),
            "average_decay": round(avg_decay, 4),
            "fresh_items": fresh_count,
            "stale_items": stale_count,
            "fresh_percentage": round(fresh_count / len(items) * 100, 1) if items else 0,
            "stale_percentage": round(stale_count / len(items) * 100, 1) if items else 0,
            "needs_review": [
                {
                    "id": item.get('id'),
                    "title": item.get('title'),
                    "decay_score": item.get('decay_score'),
                    "created_at": item.get('created_at'),
                    "access_count": item.get('access_count', 0)
                }
                for item in needs_review
            ]
        }


# Convenience function to create decay service with custom parameters
def create_decay_service(
    time_decay_half_life: Optional[float] = None,
    access_boost_factor: Optional[float] = None,
    linking_boost_factor: Optional[float] = None,
    min_decay: Optional[float] = None,
    max_decay: Optional[float] = None
) -> KnowledgeDecayService:
    """
    Factory function to create a KnowledgeDecayService with optional customization
    
    Args:
        time_decay_half_life: Days for time-based decay half-life
        access_boost_factor: Weight for access frequency
        linking_boost_factor: Weight for connection count
        min_decay: Minimum decay score
        max_decay: Maximum decay score
        
    Returns:
        Configured KnowledgeDecayService instance
    """
    return KnowledgeDecayService(
        time_decay_half_life=time_decay_half_life or KnowledgeDecayService.DEFAULT_TIME_DECAY_HALF_LIFE,
        access_boost_factor=access_boost_factor or KnowledgeDecayService.DEFAULT_ACCESS_BOOST_FACTOR,
        linking_boost_factor=linking_boost_factor or KnowledgeDecayService.DEFAULT_LINKING_BOOST_FACTOR,
        min_decay=min_decay or KnowledgeDecayService.DEFAULT_MIN_DECAY,
        max_decay=max_decay or KnowledgeDecayService.DEFAULT_MAX_DECAY
    )
