"""
Similarity computation service for Brian
Uses TF-IDF and cosine similarity to find related knowledge items
"""
from typing import List, Dict, Tuple
import re
import math
from collections import Counter, defaultdict


class SimilarityService:
    """Service for computing content similarity between knowledge items"""
    
    # Common English stop words to filter out
    STOP_WORDS = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have', 'had',
        'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all', 'each',
        'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
        'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
        'just', 'should', 'now', 'also', 'been', 'being', 'do', 'does', 'did',
        'doing', 'would', 'could', 'ought', 'am', 'were', 'been', 'being'
    }
    
    def __init__(self):
        self.documents = []
        self.idf_scores = {}
        self.tf_idf_vectors = []
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize and clean text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and split into words
        words = re.findall(r'\b[a-z]{2,}\b', text)
        
        # Filter out stop words
        words = [w for w in words if w not in self.STOP_WORDS]
        
        return words
    
    def compute_tf(self, tokens: List[str]) -> Dict[str, float]:
        """Compute term frequency for a document"""
        if not tokens:
            return {}
        
        counter = Counter(tokens)
        total_terms = len(tokens)
        
        # Normalize by document length
        return {term: count / total_terms for term, count in counter.items()}
    
    def compute_idf(self, documents: List[List[str]]) -> Dict[str, float]:
        """Compute inverse document frequency across all documents"""
        num_docs = len(documents)
        if num_docs == 0:
            return {}
        
        # Count how many documents contain each term
        doc_counts = defaultdict(int)
        for doc in documents:
            unique_terms = set(doc)
            for term in unique_terms:
                doc_counts[term] += 1
        
        # Compute IDF: log(total_docs / docs_containing_term)
        idf = {}
        for term, count in doc_counts.items():
            idf[term] = math.log(num_docs / count)
        
        return idf
    
    def compute_tf_idf(self, tf: Dict[str, float], idf: Dict[str, float]) -> Dict[str, float]:
        """Compute TF-IDF vector for a document"""
        return {term: tf_val * idf.get(term, 0) for term, tf_val in tf.items()}
    
    def cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """Compute cosine similarity between two TF-IDF vectors"""
        if not vec1 or not vec2:
            return 0.0
        
        # Get common terms
        common_terms = set(vec1.keys()) & set(vec2.keys())
        
        if not common_terms:
            return 0.0
        
        # Compute dot product
        dot_product = sum(vec1[term] * vec2[term] for term in common_terms)
        
        # Compute magnitudes
        magnitude1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
        magnitude2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def build_index(self, items: List[Dict]) -> None:
        """Build TF-IDF index for all items"""
        self.documents = []
        
        # Tokenize all documents
        for item in items:
            # Combine title, content, and tags for richer similarity
            text = f"{item['title']} {item['content']} {' '.join(item.get('tags', []))}"
            tokens = self.tokenize(text)
            self.documents.append(tokens)
        
        # Compute IDF scores
        self.idf_scores = self.compute_idf(self.documents)
        
        # Compute TF-IDF vectors for all documents
        self.tf_idf_vectors = []
        for tokens in self.documents:
            tf = self.compute_tf(tokens)
            tf_idf = self.compute_tf_idf(tf, self.idf_scores)
            self.tf_idf_vectors.append(tf_idf)
    
    def find_similar_items(
        self, 
        items: List[Dict], 
        threshold: float = 0.1,
        max_connections_per_item: int = 5
    ) -> List[Dict]:
        """
        Find similar items based on content similarity
        
        Args:
            items: List of knowledge items
            threshold: Minimum similarity score (0-1) to create a connection
            max_connections_per_item: Maximum number of connections per item
            
        Returns:
            List of connection objects with similarity scores
        """
        if len(items) < 2:
            return []
        
        # Build TF-IDF index
        self.build_index(items)
        
        connections = []
        
        # Compare each pair of items
        for i in range(len(items)):
            item_connections = []
            
            for j in range(i + 1, len(items)):
                similarity = self.cosine_similarity(
                    self.tf_idf_vectors[i],
                    self.tf_idf_vectors[j]
                )
                
                if similarity >= threshold:
                    item_connections.append({
                        'source_item_id': items[i]['id'],
                        'target_item_id': items[j]['id'],
                        'similarity': round(similarity, 3),
                        'connection_type': 'content_similarity'
                    })
            
            # Sort by similarity and take top N
            item_connections.sort(key=lambda x: x['similarity'], reverse=True)
            connections.extend(item_connections[:max_connections_per_item])
        
        return connections
    
    def get_similarity_score(self, item1: Dict, item2: Dict) -> float:
        """Get similarity score between two specific items
        
        Note: This method requires build_index() to be called first with all documents
        to get accurate IDF scores. If called without a pre-built index, it will
        build a mini-index with just these two items (less accurate).
        """
        # Tokenize both items
        text1 = f"{item1['title']} {item1['content']} {' '.join(item1.get('tags', []))}"
        text2 = f"{item2['title']} {item2['content']} {' '.join(item2.get('tags', []))}"
        
        tokens1 = self.tokenize(text1)
        tokens2 = self.tokenize(text2)
        
        # Use pre-built IDF scores if available, otherwise build mini-index
        if self.idf_scores:
            # Use the global IDF scores for more accurate similarity
            idf = self.idf_scores
        else:
            # Fallback: Build mini-index for just these two documents
            docs = [tokens1, tokens2]
            idf = self.compute_idf(docs)
        
        # Compute TF-IDF vectors
        tf1 = self.compute_tf(tokens1)
        tf2 = self.compute_tf(tokens2)
        
        vec1 = self.compute_tf_idf(tf1, idf)
        vec2 = self.compute_tf_idf(tf2, idf)
        
        return self.cosine_similarity(vec1, vec2)
    
    def get_related_items(
        self,
        target_item: Dict,
        all_items: List[Dict],
        top_k: int = 5,
        threshold: float = 0.1
    ) -> List[Tuple[Dict, float]]:
        """
        Find the most similar items to a target item
        
        Returns:
            List of (item, similarity_score) tuples, sorted by similarity
        """
        if not all_items:
            return []
        
        # Build index for all items
        self.build_index(all_items)
        
        # Find target item index
        target_idx = None
        for i, item in enumerate(all_items):
            if item['id'] == target_item['id']:
                target_idx = i
                break
        
        if target_idx is None:
            return []
        
        # Compute similarities
        similarities = []
        for i, item in enumerate(all_items):
            if i == target_idx:
                continue
            
            similarity = self.cosine_similarity(
                self.tf_idf_vectors[target_idx],
                self.tf_idf_vectors[i]
            )
            
            if similarity >= threshold:
                similarities.append((item, round(similarity, 3)))
        
        # Sort by similarity and return top K
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
