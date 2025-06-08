import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from datetime import datetime, timedelta
import json

class EntityClassifier:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.entity_types = [
            'exchange', 'miner', 'mixer', 'gambling', 'darknet', 
            'defi', 'institutional', 'retail', 'unknown'
        ]
        
    def extract_features(self, address_data):
        """Extract features from address transaction data"""
        features = {}
        
        # Transaction volume features
        features['total_volume'] = address_data['total_received'] + address_data['total_sent']
        features['avg_tx_size'] = features['total_volume'] / max(address_data['tx_count'], 1)
        features['volume_ratio'] = address_data['total_sent'] / max(address_data['total_received'], 1)
        
        # Temporal features
        features['activity_span'] = (address_data['last_seen'] - address_data['first_seen']).days
        features['tx_frequency'] = address_data['tx_count'] / max(features['activity_span'], 1)
        
        # Network features
        features['unique_counterparties'] = len(address_data.get('counterparties', []))
        features['clustering_coefficient'] = self.calculate_clustering_coefficient(address_data)
        
        # Behavioral features
        features['round_number_ratio'] = self.calculate_round_number_ratio(address_data)
        features['time_pattern_score'] = self.calculate_time_pattern_score(address_data)
        features['consolidation_ratio'] = self.calculate_consolidation_ratio(address_data)
        
        return list(features.values())
    
    def calculate_clustering_coefficient(self, address_data):
        """Calculate how interconnected the address's counterparties are"""
        counterparties = address_data.get('counterparties', [])
        if len(counterparties) < 2:
            return 0
        
        # Simplified clustering coefficient calculation
        connections = 0
        total_possible = len(counterparties) * (len(counterparties) - 1) / 2
        
        # This would need actual network data to calculate properly
        # For now, return a mock value based on counterparty count
        return min(len(counterparties) / 100, 1.0)
    
    def calculate_round_number_ratio(self, address_data):
        """Calculate ratio of round number transactions (indicator of automated behavior)"""
        transactions = address_data.get('transactions', [])
        if not transactions:
            return 0
        
        round_count = sum(1 for tx in transactions if tx['amount'] % 100000000 == 0)  # Whole BTC amounts
        return round_count / len(transactions)
    
    def calculate_time_pattern_score(self, address_data):
        """Analyze temporal patterns in transactions"""
        transactions = address_data.get('transactions', [])
        if len(transactions) < 5:
            return 0
        
        # Calculate variance in transaction timing
        timestamps = [tx['timestamp'] for tx in transactions]
        intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
        
        if not intervals:
            return 0
        
        # Higher score for more regular patterns (exchanges, automated systems)
        variance = np.var(intervals)
        return 1 / (1 + variance / 3600)  # Normalize by hour
    
    def calculate_consolidation_ratio(self, address_data):
        """Calculate ratio of consolidation vs distribution transactions"""
        transactions = address_data.get('transactions', [])
        if not transactions:
            return 0
        
        consolidations = sum(1 for tx in transactions if tx['input_count'] > tx['output_count'])
        return consolidations / len(transactions)
    
    def train_model(self, training_data):
        """Train the entity classification model"""
        print("Training entity classification model...")
        
        # Prepare training data
        X = []
        y = []
        
        for entity_type, addresses in training_data.items():
            for address_data in addresses:
                features = self.extract_features(address_data)
                X.append(features)
                y.append(entity_type)
        
        X = np.array(X)
        y = np.array(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train classifier
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Train anomaly detector
        self.anomaly_detector.fit(X_train_scaled)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        print("Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save model
        joblib.dump(self.model, 'entity_classifier_model.pkl')
        joblib.dump(self.scaler, 'entity_classifier_scaler.pkl')
        
        return self.model.score(X_test_scaled, y_test)
    
    def classify_entity(self, address_data):
        """Classify a single entity"""
        if self.model is None:
            return {'entity_type': 'unknown', 'confidence': 0.0, 'is_anomaly': False}
        
        features = self.extract_features(address_data)
        features_scaled = self.scaler.transform([features])
        
        # Get prediction and confidence
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        confidence = max(probabilities)
        
        # Check for anomalies
        anomaly_score = self.anomaly_detector.decision_function(features_scaled)[0]
        is_anomaly = self.anomaly_detector.predict(features_scaled)[0] == -1
        
        return {
            'entity_type': prediction,
            'confidence': float(confidence),
            'probabilities': dict(zip(self.model.classes_, probabilities)),
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score),
            'risk_score': self.calculate_risk_score(prediction, confidence, is_anomaly)
        }
    
    def calculate_risk_score(self, entity_type, confidence, is_anomaly):
        """Calculate risk score based on entity type and other factors"""
        risk_weights = {
            'exchange': 0.2,
            'miner': 0.1,
            'mixer': 0.9,
            'gambling': 0.7,
            'darknet': 1.0,
            'defi': 0.3,
            'institutional': 0.1,
            'retail': 0.2,
            'unknown': 0.5
        }
        
        base_risk = risk_weights.get(entity_type, 0.5)
        confidence_factor = 1 - confidence  # Lower confidence = higher risk
        anomaly_factor = 0.3 if is_anomaly else 0
        
        return min(base_risk + confidence_factor * 0.2 + anomaly_factor, 1.0)

# Example usage and training
if __name__ == "__main__":
    classifier = EntityClassifier()
    
    # Mock training data (in real implementation, this would come from labeled datasets)
    training_data = {
        'exchange': [
            {
                'total_received': 1000000000000,  # 10,000 BTC
                'total_sent': 999000000000,      # 9,990 BTC
                'tx_count': 50000,
                'first_seen': datetime.now() - timedelta(days=1000),
                'last_seen': datetime.now(),
                'counterparties': list(range(10000)),  # Many unique counterparties
                'transactions': [
                    {'amount': 100000000, 'timestamp': datetime.now().timestamp(), 'input_count': 1, 'output_count': 2}
                    for _ in range(100)
                ]
            }
        ],
        'miner': [
            {
                'total_received': 100000000,     # 1 BTC
                'total_sent': 95000000,          # 0.95 BTC
                'tx_count': 144,                 # Daily blocks
                'first_seen': datetime.now() - timedelta(days=365),
                'last_seen': datetime.now(),
                'counterparties': list(range(10)),  # Few counterparties
                'transactions': [
                    {'amount': 625000000, 'timestamp': datetime.now().timestamp(), 'input_count': 1, 'output_count': 1}
                    for _ in range(50)
                ]
            }
        ]
    }
    
    # Train the model
    accuracy = classifier.train_model(training_data)
    print(f"Model accuracy: {accuracy:.2f}")
    
    # Test classification
    test_address = {
        'total_received': 500000000000,
        'total_sent': 495000000000,
        'tx_count': 25000,
        'first_seen': datetime.now() - timedelta(days=500),
        'last_seen': datetime.now(),
        'counterparties': list(range(5000)),
        'transactions': [
            {'amount': 50000000, 'timestamp': datetime.now().timestamp(), 'input_count': 2, 'output_count': 3}
            for _ in range(100)
        ]
    }
    
    result = classifier.classify_entity(test_address)
    print(f"Classification result: {result}")
