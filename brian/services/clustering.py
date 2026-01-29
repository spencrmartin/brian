"""
Clustering service for automatic region discovery in Brian
Uses TF-IDF vectors and clustering algorithms to group related knowledge items
"""
from typing import List, Dict, Tuple, Optional
import math
import random
from collections import Counter, defaultdict
from .similarity import SimilarityService


class ClusteringService:
    """Service for clustering knowledge items into regions"""
    
    def __init__(self, similarity_service: Optional[SimilarityService] = None):
        self.similarity_service = similarity_service or SimilarityService()
        self.items = []
        self.vectors = []
        self.all_terms = set()
    
    def _build_dense_vectors(self, items: List[Dict]) -> List[List[float]]:
        """
        Build dense vectors from TF-IDF sparse vectors for clustering
        
        Returns list of vectors where each vector has the same dimensions
        """
        # Build TF-IDF index
        self.similarity_service.build_index(items)
        self.items = items
        
        # Collect all unique terms
        self.all_terms = set()
        for vec in self.similarity_service.tf_idf_vectors:
            self.all_terms.update(vec.keys())
        
        # Convert to sorted list for consistent ordering
        term_list = sorted(self.all_terms)
        term_to_idx = {term: i for i, term in enumerate(term_list)}
        
        # Build dense vectors
        dense_vectors = []
        for sparse_vec in self.similarity_service.tf_idf_vectors:
            dense = [0.0] * len(term_list)
            for term, value in sparse_vec.items():
                dense[term_to_idx[term]] = value
            dense_vectors.append(dense)
        
        self.vectors = dense_vectors
        return dense_vectors
    
    def _euclidean_distance(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute Euclidean distance between two vectors"""
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(vec1, vec2)))
    
    def _cosine_distance(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine distance (1 - cosine similarity) between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a ** 2 for a in vec1))
        magnitude2 = math.sqrt(sum(b ** 2 for b in vec2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 1.0
        
        similarity = dot_product / (magnitude1 * magnitude2)
        return 1.0 - similarity
    
    def _vector_mean(self, vectors: List[List[float]]) -> List[float]:
        """Compute the mean of a list of vectors"""
        if not vectors:
            return []
        
        n_dims = len(vectors[0])
        n_vectors = len(vectors)
        
        mean = [0.0] * n_dims
        for vec in vectors:
            for i, val in enumerate(vec):
                mean[i] += val
        
        return [m / n_vectors for m in mean]
    
    def kmeans(
        self,
        items: List[Dict],
        k: int,
        max_iterations: int = 100,
        random_seed: Optional[int] = None
    ) -> List[List[Dict]]:
        """
        K-means clustering algorithm
        
        Args:
            items: List of knowledge items to cluster
            k: Number of clusters
            max_iterations: Maximum iterations for convergence
            random_seed: Optional seed for reproducibility
            
        Returns:
            List of clusters, where each cluster is a list of items
        """
        if len(items) < k:
            # Not enough items for k clusters
            return [[item] for item in items]
        
        # Build dense vectors
        vectors = self._build_dense_vectors(items)
        
        if random_seed is not None:
            random.seed(random_seed)
        
        # Initialize centroids using k-means++ for better starting points
        centroids = self._kmeans_plus_plus_init(vectors, k)
        
        assignments = [-1] * len(vectors)
        
        for iteration in range(max_iterations):
            # Assign each point to nearest centroid
            new_assignments = []
            for vec in vectors:
                distances = [self._cosine_distance(vec, c) for c in centroids]
                new_assignments.append(distances.index(min(distances)))
            
            # Check for convergence
            if new_assignments == assignments:
                break
            
            assignments = new_assignments
            
            # Update centroids
            for i in range(k):
                cluster_vectors = [vectors[j] for j in range(len(vectors)) if assignments[j] == i]
                if cluster_vectors:
                    centroids[i] = self._vector_mean(cluster_vectors)
        
        # Group items by cluster
        clusters = [[] for _ in range(k)]
        for i, item in enumerate(items):
            clusters[assignments[i]].append(item)
        
        # Remove empty clusters
        clusters = [c for c in clusters if c]
        
        return clusters
    
    def _kmeans_plus_plus_init(self, vectors: List[List[float]], k: int) -> List[List[float]]:
        """
        K-means++ initialization for better centroid starting points
        """
        centroids = []
        
        # Choose first centroid randomly
        first_idx = random.randint(0, len(vectors) - 1)
        centroids.append(vectors[first_idx][:])
        
        # Choose remaining centroids
        for _ in range(1, k):
            # Compute distances to nearest centroid for each point
            distances = []
            for vec in vectors:
                min_dist = min(self._cosine_distance(vec, c) for c in centroids)
                distances.append(min_dist ** 2)  # Square for probability weighting
            
            # Choose next centroid with probability proportional to distance squared
            total_dist = sum(distances)
            if total_dist == 0:
                # All points are at centroids, choose randomly
                idx = random.randint(0, len(vectors) - 1)
            else:
                # Weighted random selection
                r = random.random() * total_dist
                cumulative = 0
                idx = 0
                for i, d in enumerate(distances):
                    cumulative += d
                    if cumulative >= r:
                        idx = i
                        break
            
            centroids.append(vectors[idx][:])
        
        return centroids
    
    def estimate_optimal_k(
        self,
        items: List[Dict],
        max_k: int = 10,
        method: str = 'elbow'
    ) -> int:
        """
        Estimate the optimal number of clusters using the elbow method
        
        Args:
            items: List of knowledge items
            max_k: Maximum number of clusters to try
            method: Method to use ('elbow' or 'silhouette')
            
        Returns:
            Estimated optimal number of clusters
        """
        if len(items) <= 2:
            return 1
        
        max_k = min(max_k, len(items))
        
        # Build vectors once
        vectors = self._build_dense_vectors(items)
        
        if method == 'elbow':
            return self._elbow_method(vectors, max_k)
        else:
            return self._silhouette_method(vectors, max_k)
    
    def _elbow_method(self, vectors: List[List[float]], max_k: int) -> int:
        """
        Use elbow method to find optimal k
        Looks for the "elbow" point where adding more clusters doesn't help much
        """
        inertias = []
        
        for k in range(1, max_k + 1):
            # Run k-means and compute inertia (sum of squared distances to centroids)
            clusters = self._kmeans_on_vectors(vectors, k)
            
            inertia = 0
            for cluster_indices in clusters:
                if not cluster_indices:
                    continue
                cluster_vectors = [vectors[i] for i in cluster_indices]
                centroid = self._vector_mean(cluster_vectors)
                for vec in cluster_vectors:
                    inertia += self._cosine_distance(vec, centroid) ** 2
            
            inertias.append(inertia)
        
        # Find elbow point using the maximum curvature
        if len(inertias) < 3:
            return 1
        
        # Calculate second derivative to find elbow
        best_k = 1
        max_diff = 0
        
        for i in range(1, len(inertias) - 1):
            # Second derivative approximation
            diff = (inertias[i-1] - inertias[i]) - (inertias[i] - inertias[i+1])
            if diff > max_diff:
                max_diff = diff
                best_k = i + 1
        
        return max(2, best_k)  # At least 2 clusters
    
    def _silhouette_method(self, vectors: List[List[float]], max_k: int) -> int:
        """
        Use silhouette score to find optimal k
        Higher silhouette score = better clustering
        """
        best_k = 2
        best_score = -1
        
        for k in range(2, max_k + 1):
            clusters = self._kmeans_on_vectors(vectors, k)
            score = self._compute_silhouette_score(vectors, clusters)
            
            if score > best_score:
                best_score = score
                best_k = k
        
        return best_k
    
    def _kmeans_on_vectors(self, vectors: List[List[float]], k: int) -> List[List[int]]:
        """Run k-means directly on vectors, returning cluster indices"""
        if len(vectors) < k:
            return [[i] for i in range(len(vectors))]
        
        centroids = self._kmeans_plus_plus_init(vectors, k)
        assignments = [-1] * len(vectors)
        
        for _ in range(100):
            new_assignments = []
            for vec in vectors:
                distances = [self._cosine_distance(vec, c) for c in centroids]
                new_assignments.append(distances.index(min(distances)))
            
            if new_assignments == assignments:
                break
            
            assignments = new_assignments
            
            for i in range(k):
                cluster_vectors = [vectors[j] for j in range(len(vectors)) if assignments[j] == i]
                if cluster_vectors:
                    centroids[i] = self._vector_mean(cluster_vectors)
        
        clusters = [[] for _ in range(k)]
        for i in range(len(vectors)):
            clusters[assignments[i]].append(i)
        
        return clusters
    
    def _compute_silhouette_score(self, vectors: List[List[float]], clusters: List[List[int]]) -> float:
        """Compute average silhouette score for clustering"""
        if len(clusters) < 2:
            return 0
        
        scores = []
        
        for cluster_idx, cluster in enumerate(clusters):
            for i in cluster:
                if len(cluster) == 1:
                    scores.append(0)
                    continue
                
                # a(i) = average distance to points in same cluster
                a = sum(self._cosine_distance(vectors[i], vectors[j]) for j in cluster if j != i)
                a /= (len(cluster) - 1)
                
                # b(i) = minimum average distance to points in other clusters
                b = float('inf')
                for other_idx, other_cluster in enumerate(clusters):
                    if other_idx == cluster_idx or not other_cluster:
                        continue
                    avg_dist = sum(self._cosine_distance(vectors[i], vectors[j]) for j in other_cluster)
                    avg_dist /= len(other_cluster)
                    b = min(b, avg_dist)
                
                if b == float('inf'):
                    b = 0
                
                # Silhouette score for point i
                if max(a, b) == 0:
                    s = 0
                else:
                    s = (b - a) / max(a, b)
                
                scores.append(s)
        
        return sum(scores) / len(scores) if scores else 0
    
    def extract_cluster_keywords(
        self,
        cluster_items: List[Dict],
        top_k: int = 5
    ) -> List[str]:
        """
        Extract the most representative keywords for a cluster
        
        Args:
            cluster_items: Items in the cluster
            top_k: Number of keywords to extract
            
        Returns:
            List of top keywords for the cluster
        """
        if not cluster_items:
            return []
        
        # Collect all tokens from cluster items
        all_tokens = []
        for item in cluster_items:
            text = f"{item['title']} {item['content']} {' '.join(item.get('tags', []))}"
            tokens = self.similarity_service.tokenize(text)
            all_tokens.extend(tokens)
        
        # Count term frequencies
        term_counts = Counter(all_tokens)
        
        # Weight by TF-IDF importance if available
        if self.similarity_service.idf_scores:
            weighted_counts = {}
            for term, count in term_counts.items():
                idf = self.similarity_service.idf_scores.get(term, 1.0)
                weighted_counts[term] = count * idf
            
            # Sort by weighted count
            sorted_terms = sorted(weighted_counts.items(), key=lambda x: x[1], reverse=True)
        else:
            sorted_terms = term_counts.most_common()
        
        return [term for term, _ in sorted_terms[:top_k]]
    
    def generate_cluster_name(self, cluster_items: List[Dict]) -> str:
        """
        Generate a descriptive name for a cluster based on its content
        
        Args:
            cluster_items: Items in the cluster
            
        Returns:
            Generated cluster name
        """
        keywords = self.extract_cluster_keywords(cluster_items, top_k=3)
        
        if not keywords:
            return "Unnamed Cluster"
        
        # Capitalize and join keywords
        name_parts = [kw.capitalize() for kw in keywords]
        
        if len(name_parts) == 1:
            return name_parts[0]
        elif len(name_parts) == 2:
            return f"{name_parts[0]} & {name_parts[1]}"
        else:
            return f"{name_parts[0]}, {name_parts[1]} & {name_parts[2]}"
    
    def cluster_items(
        self,
        items: List[Dict],
        n_clusters: Optional[int] = None,
        auto_detect: bool = True,
        max_clusters: int = 8
    ) -> List[Dict]:
        """
        Main method to cluster items and generate region suggestions
        
        Args:
            items: List of knowledge items to cluster
            n_clusters: Number of clusters (if None, auto-detect)
            auto_detect: Whether to auto-detect optimal number of clusters
            max_clusters: Maximum number of clusters for auto-detection
            
        Returns:
            List of cluster info dicts with:
            - name: Generated cluster name
            - keywords: Top keywords for the cluster
            - items: List of items in the cluster
            - item_ids: List of item IDs
            - size: Number of items
        """
        if len(items) < 2:
            return [{
                'name': 'All Items',
                'keywords': [],
                'items': items,
                'item_ids': [item['id'] for item in items],
                'size': len(items)
            }]
        
        # Determine number of clusters
        if n_clusters is None and auto_detect:
            n_clusters = self.estimate_optimal_k(items, max_k=min(max_clusters, len(items)))
        elif n_clusters is None:
            n_clusters = min(5, len(items))
        
        # Run clustering
        clusters = self.kmeans(items, n_clusters)
        
        # Generate cluster info
        cluster_info = []
        for cluster_items in clusters:
            if not cluster_items:
                continue
            
            info = {
                'name': self.generate_cluster_name(cluster_items),
                'keywords': self.extract_cluster_keywords(cluster_items),
                'items': cluster_items,
                'item_ids': [item['id'] for item in cluster_items],
                'size': len(cluster_items)
            }
            cluster_info.append(info)
        
        # Sort by size (largest first)
        cluster_info.sort(key=lambda x: x['size'], reverse=True)
        
        return cluster_info
