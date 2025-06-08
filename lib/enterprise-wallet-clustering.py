import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import networkx as nx
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnterpriseWalletClusterer:
    """Enterprise-grade wallet clustering with advanced analytics"""
    
    def __init__(self, enterprise_id: str):
        self.enterprise_id = enterprise_id
        self.scaler = StandardScaler()
        self.clustering_models = {}
        self.entity_classifier = EntityClassifier()
        self.risk_analyzer = RiskAnalyzer()
        self.flow_tracker = FlowTracker()
        
    def cluster_wallets(self, wallet_data: List[Dict], algorithm: str = 'dbscan') -> Dict[str, Any]:
        """Advanced wallet clustering with multiple algorithms"""
        try:
            # Extract comprehensive features
            features = self._extract_enterprise_features(wallet_data)
            
            # Normalize features
            features_scaled = self.scaler.fit_transform(features)
            
            # Apply clustering algorithm
            if algorithm == 'dbscan':
                clusters = self._dbscan_clustering(features_scaled)
            elif algorithm == 'kmeans':
                clusters = self._kmeans_clustering(features_scaled)
            elif algorithm == 'hierarchical':
                clusters = self._hierarchical_clustering(features_scaled)
            else:
                raise ValueError(f"Unsupported algorithm: {algorithm}")
            
            # Analyze clusters
            cluster_analysis = self._analyze_clusters(wallet_data, clusters)
            
            # Generate insights
            insights = self._generate_enterprise_insights(cluster_analysis)
            
            return {
                'clusters': clusters,
                'analysis': cluster_analysis,
                'insights': insights,
                'algorithm_used': algorithm,
                'feature_count': features.shape[1],
                'wallet_count': len(wallet_data),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Clustering error: {e}")
            return {'error': str(e)}
    
    def _extract_enterprise_features(self, wallet_data: List[Dict]) -> np.ndarray:
        """Extract comprehensive features for enterprise analysis"""
        features = []
        
        for wallet in wallet_data:
            wallet_features = []
            
            # Basic transaction features
            tx_count = wallet.get('transaction_count', 0)
            total_volume = wallet.get('total_volume', 0)
            avg_tx_value = total_volume / max(tx_count, 1)
            
            wallet_features.extend([
                np.log10(max(total_volume, 1)),  # Log total volume
                tx_count,  # Transaction count
                np.log10(max(avg_tx_value, 1)),  # Log average transaction
            ])
            
            # Temporal features
            timestamps = wallet.get('transaction_timestamps', [])
            if len(timestamps) > 1:
                intervals = np.diff(sorted(timestamps))
                wallet_features.extend([
                    np.mean(intervals),  # Average interval
                    np.std(intervals),   # Interval variance
                    len(set([ts // 86400 for ts in timestamps])),  # Active days
                ])
            else:
                wallet_features.extend([0, 0, 0])
            
            # Network features
            counterparties = wallet.get('counterparties', [])
            wallet_features.extend([
                len(set(counterparties)),  # Unique counterparties
                len(counterparties) / max(tx_count, 1),  # Counterparty ratio
            ])
            
            # Behavioral features
            transactions = wallet.get('transactions', [])
            wallet_features.extend([
                self._calculate_round_number_ratio(transactions),
                self._calculate_consolidation_ratio(transactions),
                self._calculate_mixing_score(transactions),
                self._calculate_exchange_interaction_score(wallet),
                self._calculate_dormancy_score(timestamps),
                self._calculate_fee_sensitivity(transactions),
                self._calculate_utxo_age_entropy(wallet),
                self._calculate_time_zone_entropy(timestamps),
                self._calculate_amount_distribution_entropy(transactions),
                self._calculate_velocity_score(wallet),
            ])
            
            # Risk indicators
            wallet_features.extend([
                self._calculate_privacy_score(transactions),
                self._calculate_institutional_score(wallet),
                self._calculate_suspicious_pattern_score(transactions),
            ])
            
            features.append(wallet_features)
        
        return np.array(features)
    
    def _calculate_round_number_ratio(self, transactions: List[Dict]) -> float:
        """Calculate ratio of round number transactions"""
        if not transactions:
            return 0.0
        
        round_count = sum(1 for tx in transactions 
                         if tx.get('amount', 0) % 100000000 == 0)  # Whole BTC
        return round_count / len(transactions)
    
    def _calculate_consolidation_ratio(self, transactions: List[Dict]) -> float:
        """Calculate consolidation vs distribution ratio"""
        if not transactions:
            return 0.0
        
        consolidations = sum(1 for tx in transactions 
                           if tx.get('input_count', 0) > tx.get('output_count', 0))
        return consolidations / len(transactions)
    
    def _calculate_mixing_score(self, transactions: List[Dict]) -> float:
        """Calculate privacy/mixing behavior score"""
        if not transactions:
            return 0.0
        
        mixing_indicators = 0
        for tx in transactions:
            outputs = tx.get('outputs', [])
            if len(outputs) > 2:
                # Check for equal output amounts (CoinJoin indicator)
                amounts = [out.get('amount', 0) for out in outputs]
                unique_amounts = len(set(amounts))
                if unique_amounts < len(amounts) * 0.5:
                    mixing_indicators += 1
        
        return mixing_indicators / len(transactions)
    
    def _calculate_exchange_interaction_score(self, wallet: Dict) -> float:
        """Calculate interaction with known exchanges"""
        counterparties = wallet.get('counterparties', [])
        known_exchanges = wallet.get('known_exchange_addresses', set())
        
        if not counterparties:
            return 0.0
        
        exchange_interactions = sum(1 for addr in counterparties 
                                  if addr in known_exchanges)
        return exchange_interactions / len(counterparties)
    
    def _calculate_dormancy_score(self, timestamps: List[int]) -> float:
        """Calculate dormancy behavior score"""
        if len(timestamps) < 2:
            return 0.0
        
        sorted_timestamps = sorted(timestamps)
        gaps = np.diff(sorted_timestamps)
        long_gaps = sum(1 for gap in gaps if gap > 86400 * 30)  # 30+ days
        return long_gaps / len(gaps)
    
    def _calculate_fee_sensitivity(self, transactions: List[Dict]) -> float:
        """Calculate fee sensitivity score"""
        if not transactions:
            return 0.0
        
        fees = [tx.get('fee', 0) for tx in transactions if tx.get('fee', 0) > 0]
        if not fees:
            return 0.0
        
        return np.std(fees) / np.mean(fees) if np.mean(fees) > 0 else 0
    
    def _calculate_utxo_age_entropy(self, wallet: Dict) -> float:
        """Calculate UTXO age distribution entropy"""
        utxos = wallet.get('utxos', [])
        if not utxos:
            return 0.0
        
        current_time = datetime.now().timestamp()
        ages = [(current_time - utxo.get('created_at', current_time)) / 86400 
                for utxo in utxos]
        
        bins = np.histogram(ages, bins=10)[0]
        bins = bins[bins > 0]
        if len(bins) == 0:
            return 0.0
        
        probs = bins / np.sum(bins)
        entropy = -np.sum(probs * np.log2(probs))
        return entropy
    
    def _calculate_time_zone_entropy(self, timestamps: List[int]) -> float:
        """Calculate time zone distribution entropy"""
        if not timestamps:
            return 0.0
        
        hours = [(ts % 86400) // 3600 for ts in timestamps]
        hour_counts = np.bincount(hours, minlength=24)
        hour_counts = hour_counts[hour_counts > 0]
        
        if len(hour_counts) == 0:
            return 0.0
        
        probs = hour_counts / np.sum(hour_counts)
        entropy = -np.sum(probs * np.log2(probs))
        return entropy
    
    def _calculate_amount_distribution_entropy(self, transactions: List[Dict]) -> float:
        """Calculate transaction amount distribution entropy"""
        if not transactions:
            return 0.0
        
        amounts = [tx.get('amount', 0) for tx in transactions if tx.get('amount', 0) > 0]
        if not amounts:
            return 0.0
        
        # Log-scale binning
        log_amounts = np.log10(amounts)
        bins = np.histogram(log_amounts, bins=10)[0]
        bins = bins[bins > 0]
        
        if len(bins) == 0:
            return 0.0
        
        probs = bins / np.sum(bins)
        entropy = -np.sum(probs * np.log2(probs))
        return entropy
    
    def _calculate_velocity_score(self, wallet: Dict) -> float:
        """Calculate transaction velocity score"""
        tx_count = wallet.get('transaction_count', 0)
        time_span = wallet.get('activity_span_days', 1)
        return tx_count / max(time_span, 1)
    
    def _calculate_privacy_score(self, transactions: List[Dict]) -> float:
        """Calculate privacy-seeking behavior score"""
        if not transactions:
            return 0.0
        
        privacy_indicators = 0
        for tx in transactions:
            # Multiple outputs of similar size
            outputs = tx.get('outputs', [])
            if len(outputs) > 2:
                amounts = [out.get('amount', 0) for out in outputs]
                if len(set(amounts)) < len(amounts) * 0.7:
                    privacy_indicators += 1
            
            # High fee for privacy
            fee_rate = tx.get('fee', 0) / max(tx.get('amount', 1), 1)
            if fee_rate > 0.001:  # High fee rate
                privacy_indicators += 0.5
        
        return privacy_indicators / len(transactions)
    
    def _calculate_institutional_score(self, wallet: Dict) -> float:
        """Calculate institutional behavior score"""
        score = 0.0
        
        # Large balance
        balance = wallet.get('balance', 0)
        if balance > 1000:  # > 1000 BTC
            score += 0.3
        
        # Regular transaction patterns
        timestamps = wallet.get('transaction_timestamps', [])
        if len(timestamps) > 10:
            intervals = np.diff(sorted(timestamps))
            regularity = 1 - (np.std(intervals) / np.mean(intervals)) if np.mean(intervals) > 0 else 0
            score += regularity * 0.3
        
        # Exchange interactions
        score += self._calculate_exchange_interaction_score(wallet) * 0.4
        
        return min(score, 1.0)
    
    def _calculate_suspicious_pattern_score(self, transactions: List[Dict]) -> float:
        """Calculate suspicious activity pattern score"""
        if not transactions:
            return 0.0
        
        suspicious_indicators = 0
        
        for tx in transactions:
            # Rapid succession transactions
            # Unusual amounts (very round or very specific)
            amount = tx.get('amount', 0)
            if amount > 0:
                if amount % 1000000 == 0:  # Very round amounts
                    suspicious_indicators += 0.5
                elif str(amount).count('0') > 6:  # Many zeros
                    suspicious_indicators += 0.3
        
        return min(suspicious_indicators / len(transactions), 1.0)
    
    def _dbscan_clustering(self, features: np.ndarray) -> Dict[str, Any]:
        """DBSCAN clustering implementation"""
        dbscan = DBSCAN(eps=0.5, min_samples=5)
        cluster_labels = dbscan.fit_predict(features)
        
        return {
            'algorithm': 'dbscan',
            'labels': cluster_labels.tolist(),
            'n_clusters': len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0),
            'n_outliers': list(cluster_labels).count(-1),
            'parameters': {'eps': 0.5, 'min_samples': 5}
        }
    
    def _kmeans_clustering(self, features: np.ndarray, n_clusters: int = 8) -> Dict[str, Any]:
        """K-means clustering implementation"""
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(features)
        
        return {
            'algorithm': 'kmeans',
            'labels': cluster_labels.tolist(),
            'n_clusters': n_clusters,
            'cluster_centers': kmeans.cluster_centers_.tolist(),
            'inertia': kmeans.inertia_,
            'parameters': {'n_clusters': n_clusters}
        }
    
    def _hierarchical_clustering(self, features: np.ndarray) -> Dict[str, Any]:
        """Hierarchical clustering implementation"""
        from sklearn.cluster import AgglomerativeClustering
        
        hierarchical = AgglomerativeClustering(n_clusters=8)
        cluster_labels = hierarchical.fit_predict(features)
        
        return {
            'algorithm': 'hierarchical',
            'labels': cluster_labels.tolist(),
            'n_clusters': 8,
            'parameters': {'n_clusters': 8, 'linkage': 'ward'}
        }
    
    def _analyze_clusters(self, wallet_data: List[Dict], clusters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cluster characteristics"""
        cluster_labels = clusters['labels']
        analysis = {}
        
        for cluster_id in set(cluster_labels):
            if cluster_id == -1:  # Outliers in DBSCAN
                continue
            
            cluster_wallets = [wallet_data[i] for i, label in enumerate(cluster_labels) if label == cluster_id]
            
            # Calculate cluster statistics
            total_volume = sum(w.get('total_volume', 0) for w in cluster_wallets)
            avg_tx_count = np.mean([w.get('transaction_count', 0) for w in cluster_wallets])
            avg_balance = np.mean([w.get('balance', 0) for w in cluster_wallets])
            
            # Entity classification
            entity_types = [self.entity_classifier.classify(w) for w in cluster_wallets]
            dominant_entity = max(set(entity_types), key=entity_types.count) if entity_types else 'unknown'
            
            # Risk assessment
            risk_scores = [self.risk_analyzer.calculate_risk(w) for w in cluster_wallets]
            avg_risk = np.mean(risk_scores)
            
            analysis[f'cluster_{cluster_id}'] = {
                'size': len(cluster_wallets),
                'total_volume': total_volume,
                'avg_transaction_count': avg_tx_count,
                'avg_balance': avg_balance,
                'dominant_entity_type': dominant_entity,
                'avg_risk_score': avg_risk,
                'risk_level': self._categorize_risk(avg_risk),
                'wallet_addresses': [w.get('address') for w in cluster_wallets[:10]]  # Sample addresses
            }
        
        return analysis
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk score into levels"""
        if risk_score > 0.8:
            return 'critical'
        elif risk_score > 0.6:
            return 'high'
        elif risk_score > 0.4:
            return 'medium'
        else:
            return 'low'
    
    def _generate_enterprise_insights(self, cluster_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate enterprise-level insights"""
        insights = {
            'summary': {},
            'risk_distribution': {},
            'entity_distribution': {},
            'recommendations': []
        }
        
        # Summary statistics
        total_clusters = len(cluster_analysis)
        total_wallets = sum(cluster['size'] for cluster in cluster_analysis.values())
        total_volume = sum(cluster['total_volume'] for cluster in cluster_analysis.values())
        
        insights['summary'] = {
            'total_clusters': total_clusters,
            'total_wallets': total_wallets,
            'total_volume': total_volume,
            'avg_cluster_size': total_wallets / max(total_clusters, 1)
        }
        
        # Risk distribution
        risk_counts = {}
        for cluster in cluster_analysis.values():
            risk_level = cluster['risk_level']
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + cluster['size']
        
        insights['risk_distribution'] = risk_counts
        
        # Entity distribution
        entity_counts = {}
        for cluster in cluster_analysis.values():
            entity_type = cluster['dominant_entity_type']
            entity_counts[entity_type] = entity_counts.get(entity_type, 0) + cluster['size']
        
        insights['entity_distribution'] = entity_counts
        
        # Generate recommendations
        high_risk_clusters = [k for k, v in cluster_analysis.items() if v['risk_level'] in ['high', 'critical']]
        if high_risk_clusters:
            insights['recommendations'].append({
                'type': 'security',
                'priority': 'high',
                'message': f"Monitor {len(high_risk_clusters)} high-risk clusters closely",
                'clusters': high_risk_clusters
            })
        
        large_clusters = [k for k, v in cluster_analysis.items() if v['size'] > 100]
        if large_clusters:
            insights['recommendations'].append({
                'type': 'analysis',
                'priority': 'medium',
                'message': f"Investigate {len(large_clusters)} large clusters for institutional activity",
                'clusters': large_clusters
            })
        
        return insights

class EntityClassifier:
    """Enterprise entity classification"""
    
    def __init__(self):
        self.entity_rules = {
            'exchange': self._is_exchange,
            'mixer': self._is_mixer,
            'whale': self._is_whale,
            'miner': self._is_miner,
            'institutional': self._is_institutional,
            'retail': self._is_retail
        }
    
    def classify(self, wallet: Dict) -> str:
        """Classify wallet entity type"""
        for entity_type, rule_func in self.entity_rules.items():
            if rule_func(wallet):
                return entity_type
        return 'unknown'
    
    def _is_exchange(self, wallet: Dict) -> bool:
        """Check if wallet belongs to an exchange"""
        tx_count = wallet.get('transaction_count', 0)
        unique_counterparties = len(wallet.get('counterparties', []))
        
        return (tx_count > 1000 and 
                unique_counterparties > 500 and
                unique_counterparties / tx_count > 0.3)
    
    def _is_mixer(self, wallet: Dict) -> bool:
        """Check if wallet is a mixer"""
        transactions = wallet.get('transactions', [])
        if not transactions:
            return False
        
        # Look for mixing patterns
        equal_output_count = 0
        for tx in transactions:
            outputs = tx.get('outputs', [])
            if len(outputs) > 2:
                amounts = [out.get('amount', 0) for out in outputs]
                if len(set(amounts)) < len(amounts) * 0.5:
                    equal_output_count += 1
        
        return equal_output_count / len(transactions) > 0.3
    
    def _is_whale(self, wallet: Dict) -> bool:
        """Check if wallet is a whale"""
        balance = wallet.get('balance', 0)
        avg_tx_value = wallet.get('total_volume', 0) / max(wallet.get('transaction_count', 1), 1)
        
        return balance > 1000 or avg_tx_value > 100  # 1000+ BTC or 100+ BTC avg tx
    
    def _is_miner(self, wallet: Dict) -> bool:
        """Check if wallet belongs to a miner"""
        transactions = wallet.get('transactions', [])
        if not transactions:
            return False
        
        # Look for coinbase transactions and regular patterns
        coinbase_count = sum(1 for tx in transactions if tx.get('is_coinbase', False))
        regular_intervals = self._has_regular_intervals(wallet.get('transaction_timestamps', []))
        
        return coinbase_count > 0 or regular_intervals
    
    def _is_institutional(self, wallet: Dict) -> bool:
        """Check if wallet is institutional"""
        balance = wallet.get('balance', 0)
        tx_count = wallet.get('transaction_count', 0)
        
        # Large balance with moderate activity
        return balance > 500 and tx_count > 50 and tx_count < 1000
    
    def _is_retail(self, wallet: Dict) -> bool:
        """Check if wallet is retail"""
        balance = wallet.get('balance', 0)
        tx_count = wallet.get('transaction_count', 0)
        
        return balance < 10 and tx_count < 100
    
    def _has_regular_intervals(self, timestamps: List[int]) -> bool:
        """Check for regular transaction intervals"""
        if len(timestamps) < 5:
            return False
        
        intervals = np.diff(sorted(timestamps))
        cv = np.std(intervals) / np.mean(intervals) if np.mean(intervals) > 0 else float('inf')
        return cv < 0.3  # Low coefficient of variation indicates regularity

class RiskAnalyzer:
    """Enterprise risk analysis"""
    
    def calculate_risk(self, wallet: Dict) -> float:
        """Calculate comprehensive risk score"""
        risk_factors = []
        
        # Volume-based risk
        total_volume = wallet.get('total_volume', 0)
        if total_volume > 10000:  # Very high volume
            risk_factors.append(0.3)
        elif total_volume > 1000:
            risk_factors.append(0.1)
        
        # Privacy-seeking behavior
        transactions = wallet.get('transactions', [])
        if transactions:
            mixing_score = self._calculate_mixing_score(transactions)
            risk_factors.append(mixing_score * 0.4)
        
        # Suspicious patterns
        suspicious_score = self._calculate_suspicious_patterns(wallet)
        risk_factors.append(suspicious_score * 0.3)
        
        # Combine risk factors
        total_risk = sum(risk_factors)
        return min(total_risk, 1.0)
    
    def _calculate_mixing_score(self, transactions: List[Dict]) -> float:
        """Calculate mixing behavior score"""
        if not transactions:
            return 0.0
        
        mixing_indicators = 0
        for tx in transactions:
            outputs = tx.get('outputs', [])
            if len(outputs) > 2:
                amounts = [out.get('amount', 0) for out in outputs]
                if len(set(amounts)) < len(amounts) * 0.5:
                    mixing_indicators += 1
        
        return mixing_indicators / len(transactions)
    
    def _calculate_suspicious_patterns(self, wallet: Dict) -> float:
        """Calculate suspicious pattern score"""
        score = 0.0
        
        # Rapid transactions
        timestamps = wallet.get('transaction_timestamps', [])
        if len(timestamps) > 1:
            intervals = np.diff(sorted(timestamps))
            rapid_count = sum(1 for interval in intervals if interval < 3600)  # < 1 hour
            score += (rapid_count / len(intervals)) * 0.5
        
        # Unusual amounts
        transactions = wallet.get('transactions', [])
        if transactions:
            amounts = [tx.get('amount', 0) for tx in transactions]
            round_amounts = sum(1 for amount in amounts if amount % 100000000 == 0)
            score += (round_amounts / len(amounts)) * 0.3
        
        return min(score, 1.0)

class FlowTracker:
    """Enterprise fund flow tracking"""
    
    def __init__(self):
        self.flow_graph = nx.DiGraph()
    
    def track_flows(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Track fund flows between wallets"""
        # Build transaction graph
        for tx in transactions:
            from_addr = tx.get('from_address')
            to_addr = tx.get('to_address')
            amount = tx.get('amount', 0)
            
            if from_addr and to_addr:
                if self.flow_graph.has_edge(from_addr, to_addr):
                    self.flow_graph[from_addr][to_addr]['weight'] += amount
                    self.flow_graph[from_addr][to_addr]['count'] += 1
                else:
                    self.flow_graph.add_edge(from_addr, to_addr, weight=amount, count=1)
        
        # Analyze flows
        analysis = {
            'total_flows': len(self.flow_graph.edges()),
            'total_wallets': len(self.flow_graph.nodes()),
            'largest_flows': self._get_largest_flows(),
            'hub_wallets': self._identify_hubs(),
            'flow_patterns': self._analyze_patterns()
        }
        
        return analysis
    
    def _get_largest_flows(self, top_n: int = 10) -> List[Dict]:
        """Get largest fund flows"""
        flows = []
        for from_addr, to_addr, data in self.flow_graph.edges(data=True):
            flows.append({
                'from': from_addr,
                'to': to_addr,
                'amount': data['weight'],
                'transaction_count': data['count']
            })
        
        return sorted(flows, key=lambda x: x['amount'], reverse=True)[:top_n]
    
    def _identify_hubs(self, min_degree: int = 10) -> List[Dict]:
        """Identify hub wallets with high connectivity"""
        hubs = []
        for node in self.flow_graph.nodes():
            in_degree = self.flow_graph.in_degree(node)
            out_degree = self.flow_graph.out_degree(node)
            total_degree = in_degree + out_degree
            
            if total_degree >= min_degree:
                hubs.append({
                    'address': node,
                    'in_degree': in_degree,
                    'out_degree': out_degree,
                    'total_degree': total_degree
                })
        
        return sorted(hubs, key=lambda x: x['total_degree'], reverse=True)
    
    def _analyze_patterns(self) -> Dict[str, Any]:
        """Analyze flow patterns"""
        patterns = {
            'cycles': len(list(nx.simple_cycles(self.flow_graph))),
            'strongly_connected_components': nx.number_strongly_connected_components(self.flow_graph),
            'weakly_connected_components': nx.number_weakly_connected_components(self.flow_graph)
        }
        
        return patterns

# Example usage and testing
if __name__ == "__main__":
    # Initialize enterprise clusterer
    clusterer = EnterpriseWalletClusterer("enterprise_123")
    
    # Mock wallet data for testing
    mock_wallet_data = [
        {
            'address': f'bc1q{i:040x}',
            'balance': np.random.lognormal(5, 2),
            'transaction_count': np.random.poisson(50),
            'total_volume': np.random.lognormal(8, 1.5),
            'transaction_timestamps': [1640995200 + i * 3600 + np.random.randint(-1800, 1800) 
                                     for i in range(np.random.randint(10, 100))],
            'counterparties': [f'addr_{j}' for j in range(np.random.randint(5, 50))],
            'transactions': [
                {
                    'amount': np.random.lognormal(5, 1),
                    'fee': np.random.exponential(0.0001),
                    'input_count': np.random.randint(1, 5),
                    'output_count': np.random.randint(1, 5),
                    'outputs': [{'amount': np.random.lognormal(4, 1)} 
                               for _ in range(np.random.randint(1, 5))]
                }
                for _ in range(np.random.randint(5, 20))
            ],
            'utxos': [
                {'created_at': 1640995200 + np.random.randint(0, 86400 * 365)}
                for _ in range(np.random.randint(1, 10))
            ]
        }
        for i in range(100)
    ]
    
    # Run clustering analysis
    print("Running enterprise wallet clustering analysis...")
    results = clusterer.cluster_wallets(mock_wallet_data, algorithm='dbscan')
    
    print(json.dumps(results, indent=2, default=str))
