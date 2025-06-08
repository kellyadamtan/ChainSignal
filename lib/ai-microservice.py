import numpy as np
import pandas as pd
import onnxruntime as ort
from prophet import Prophet
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import json
from datetime import datetime, timedelta
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WalletBehaviorClassifier:
    """Advanced wallet behavior classification using ONNX runtime"""
    
    def __init__(self, model_path: str = "models/wallet_classifier.onnx"):
        self.model_path = model_path
        self.session = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'transaction_frequency', 'avg_transaction_size', 'total_volume',
            'unique_counterparties', 'time_variance', 'round_number_ratio',
            'consolidation_ratio', 'mixing_score', 'exchange_interaction',
            'dormancy_periods', 'gas_price_sensitivity', 'utxo_age_distribution'
        ]
        self.entity_types = [
            'exchange', 'miner', 'mixer', 'gambling', 'defi', 
            'institutional', 'retail', 'whale', 'unknown'
        ]
        
    def load_model(self):
        """Load ONNX model for inference"""
        try:
            self.session = ort.InferenceSession(self.model_path)
            logger.info(f"ONNX model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load ONNX model: {e}")
            # Fallback to sklearn model
            self.session = joblib.load("models/wallet_classifier_sklearn.pkl")
    
    def extract_features(self, wallet_data: Dict) -> np.ndarray:
        """Extract features from wallet transaction data"""
        features = {}
        
        # Transaction frequency features
        tx_count = wallet_data.get('transaction_count', 0)
        time_span = wallet_data.get('activity_span_days', 1)
        features['transaction_frequency'] = tx_count / max(time_span, 1)
        
        # Volume and size features
        total_volume = wallet_data.get('total_volume', 0)
        features['avg_transaction_size'] = total_volume / max(tx_count, 1)
        features['total_volume'] = np.log10(max(total_volume, 1))
        
        # Network features
        features['unique_counterparties'] = len(wallet_data.get('counterparties', []))
        
        # Temporal patterns
        tx_timestamps = wallet_data.get('transaction_timestamps', [])
        if len(tx_timestamps) > 1:
            intervals = np.diff(sorted(tx_timestamps))
            features['time_variance'] = np.var(intervals) if len(intervals) > 0 else 0
        else:
            features['time_variance'] = 0
        
        # Behavioral patterns
        features['round_number_ratio'] = self._calculate_round_number_ratio(wallet_data)
        features['consolidation_ratio'] = self._calculate_consolidation_ratio(wallet_data)
        features['mixing_score'] = self._calculate_mixing_score(wallet_data)
        features['exchange_interaction'] = self._calculate_exchange_interaction(wallet_data)
        features['dormancy_periods'] = self._calculate_dormancy_periods(wallet_data)
        features['gas_price_sensitivity'] = self._calculate_gas_sensitivity(wallet_data)
        features['utxo_age_distribution'] = self._calculate_utxo_age_distribution(wallet_data)
        
        # Convert to numpy array in correct order
        feature_vector = np.array([features[name] for name in self.feature_names])
        return feature_vector.reshape(1, -1)
    
    def _calculate_round_number_ratio(self, wallet_data: Dict) -> float:
        """Calculate ratio of round number transactions"""
        transactions = wallet_data.get('transactions', [])
        if not transactions:
            return 0.0
        
        round_count = sum(1 for tx in transactions 
                         if tx.get('amount', 0) % 100000000 == 0)  # Whole BTC
        return round_count / len(transactions)
    
    def _calculate_consolidation_ratio(self, wallet_data: Dict) -> float:
        """Calculate consolidation vs distribution ratio"""
        transactions = wallet_data.get('transactions', [])
        if not transactions:
            return 0.0
        
        consolidations = sum(1 for tx in transactions 
                           if tx.get('input_count', 0) > tx.get('output_count', 0))
        return consolidations / len(transactions)
    
    def _calculate_mixing_score(self, wallet_data: Dict) -> float:
        """Calculate privacy/mixing behavior score"""
        transactions = wallet_data.get('transactions', [])
        if not transactions:
            return 0.0
        
        # Look for CoinJoin patterns, equal outputs, etc.
        mixing_indicators = 0
        for tx in transactions:
            outputs = tx.get('outputs', [])
            if len(outputs) > 2:
                # Check for equal output amounts (CoinJoin indicator)
                amounts = [out.get('amount', 0) for out in outputs]
                unique_amounts = len(set(amounts))
                if unique_amounts < len(amounts) * 0.5:  # Many equal amounts
                    mixing_indicators += 1
        
        return mixing_indicators / len(transactions)
    
    def _calculate_exchange_interaction(self, wallet_data: Dict) -> float:
        """Calculate interaction with known exchanges"""
        counterparties = wallet_data.get('counterparties', [])
        known_exchanges = wallet_data.get('known_exchange_addresses', set())
        
        if not counterparties:
            return 0.0
        
        exchange_interactions = sum(1 for addr in counterparties 
                                  if addr in known_exchanges)
        return exchange_interactions / len(counterparties)
    
    def _calculate_dormancy_periods(self, wallet_data: Dict) -> float:
        """Calculate dormancy behavior"""
        tx_timestamps = wallet_data.get('transaction_timestamps', [])
        if len(tx_timestamps) < 2:
            return 0.0
        
        sorted_timestamps = sorted(tx_timestamps)
        gaps = np.diff(sorted_timestamps)
        long_gaps = sum(1 for gap in gaps if gap > 86400 * 30)  # 30+ days
        return long_gaps / len(gaps)
    
    def _calculate_gas_sensitivity(self, wallet_data: Dict) -> float:
        """Calculate sensitivity to gas prices (for Bitcoin: fee sensitivity)"""
        transactions = wallet_data.get('transactions', [])
        if not transactions:
            return 0.0
        
        fees = [tx.get('fee', 0) for tx in transactions if tx.get('fee', 0) > 0]
        if not fees:
            return 0.0
        
        # Calculate coefficient of variation for fees
        return np.std(fees) / np.mean(fees) if np.mean(fees) > 0 else 0
    
    def _calculate_utxo_age_distribution(self, wallet_data: Dict) -> float:
        """Calculate UTXO age distribution entropy"""
        utxos = wallet_data.get('utxos', [])
        if not utxos:
            return 0.0
        
        current_time = datetime.now().timestamp()
        ages = [(current_time - utxo.get('created_at', current_time)) / 86400 
                for utxo in utxos]  # Age in days
        
        # Bin ages and calculate entropy
        bins = np.histogram(ages, bins=10)[0]
        bins = bins[bins > 0]  # Remove empty bins
        if len(bins) == 0:
            return 0.0
        
        probs = bins / np.sum(bins)
        entropy = -np.sum(probs * np.log2(probs))
        return entropy
    
    def predict(self, wallet_data: Dict) -> Dict[str, Any]:
        """Predict wallet entity type and confidence"""
        if self.session is None:
            self.load_model()
        
        try:
            # Extract features
            features = self.extract_features(wallet_data)
            features_scaled = self.scaler.fit_transform(features)
            
            # ONNX inference
            if isinstance(self.session, ort.InferenceSession):
                input_name = self.session.get_inputs()[0].name
                outputs = self.session.run(None, {input_name: features_scaled.astype(np.float32)})
                probabilities = outputs[0][0]  # Assuming softmax output
                predicted_class = np.argmax(probabilities)
            else:
                # Fallback sklearn prediction
                probabilities = self.session.predict_proba(features_scaled)[0]
                predicted_class = np.argmax(probabilities)
            
            # Calculate confidence and risk score
            confidence = float(np.max(probabilities))
            entity_type = self.entity_types[predicted_class]
            risk_score = self._calculate_risk_score(entity_type, confidence, wallet_data)
            
            return {
                'entity_type': entity_type,
                'confidence': confidence,
                'risk_score': risk_score,
                'probabilities': {
                    self.entity_types[i]: float(prob) 
                    for i, prob in enumerate(probabilities)
                },
                'features': {
                    name: float(val) for name, val in 
                    zip(self.feature_names, features[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                'entity_type': 'unknown',
                'confidence': 0.0,
                'risk_score': 0.5,
                'error': str(e)
            }
    
    def _calculate_risk_score(self, entity_type: str, confidence: float, wallet_data: Dict) -> float:
        """Calculate risk score based on entity type and behavior"""
        base_risk = {
            'exchange': 0.2, 'miner': 0.1, 'mixer': 0.9, 'gambling': 0.8,
            'defi': 0.3, 'institutional': 0.1, 'retail': 0.2, 
            'whale': 0.4, 'unknown': 0.5
        }.get(entity_type, 0.5)
        
        # Adjust based on confidence
        confidence_factor = 1 - confidence  # Lower confidence = higher risk
        
        # Adjust based on transaction patterns
        volume_factor = min(wallet_data.get('total_volume', 0) / 1000, 0.3)  # High volume = higher risk
        
        final_risk = min(base_risk + confidence_factor * 0.2 + volume_factor, 1.0)
        return final_risk

class TimeSeriesForecaster:
    """Time-series forecasting using Prophet"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
    
    def prepare_data(self, data: List[Dict], target_column: str) -> pd.DataFrame:
        """Prepare data for Prophet forecasting"""
        df = pd.DataFrame(data)
        df['ds'] = pd.to_datetime(df['timestamp'])
        df['y'] = df[target_column]
        return df[['ds', 'y']].dropna()
    
    def train_model(self, wallet_address: str, transaction_data: List[Dict]) -> Dict[str, Any]:
        """Train Prophet model for wallet behavior forecasting"""
        try:
            # Prepare different time series
            volume_df = self.prepare_data(transaction_data, 'volume')
            frequency_df = self._prepare_frequency_data(transaction_data)
            
            results = {}
            
            # Volume forecasting
            if len(volume_df) >= 10:  # Minimum data points
                volume_model = Prophet(
                    changepoint_prior_scale=0.05,
                    seasonality_prior_scale=10,
                    holidays_prior_scale=10,
                    daily_seasonality=True,
                    weekly_seasonality=True,
                    yearly_seasonality=False
                )
                volume_model.fit(volume_df)
                self.models[f"{wallet_address}_volume"] = volume_model
                results['volume_model_trained'] = True
            
            # Frequency forecasting
            if len(frequency_df) >= 10:
                freq_model = Prophet(
                    changepoint_prior_scale=0.1,
                    seasonality_prior_scale=5
                )
                freq_model.fit(frequency_df)
                self.models[f"{wallet_address}_frequency"] = freq_model
                results['frequency_model_trained'] = True
            
            return results
            
        except Exception as e:
            logger.error(f"Model training error: {e}")
            return {'error': str(e)}
    
    def _prepare_frequency_data(self, transaction_data: List[Dict]) -> pd.DataFrame:
        """Prepare transaction frequency data"""
        df = pd.DataFrame(transaction_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Group by day and count transactions
        daily_counts = df.groupby(df['timestamp'].dt.date).size().reset_index()
        daily_counts.columns = ['ds', 'y']
        daily_counts['ds'] = pd.to_datetime(daily_counts['ds'])
        
        return daily_counts
    
    def forecast(self, wallet_address: str, periods: int = 30) -> Dict[str, Any]:
        """Generate forecasts for wallet behavior"""
        try:
            results = {}
            
            # Volume forecast
            volume_model = self.models.get(f"{wallet_address}_volume")
            if volume_model:
                future_volume = volume_model.make_future_dataframe(periods=periods)
                volume_forecast = volume_model.predict(future_volume)
                results['volume_forecast'] = {
                    'dates': volume_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                    'predicted': volume_forecast['yhat'].tolist(),
                    'lower_bound': volume_forecast['yhat_lower'].tolist(),
                    'upper_bound': volume_forecast['yhat_upper'].tolist()
                }
            
            # Frequency forecast
            freq_model = self.models.get(f"{wallet_address}_frequency")
            if freq_model:
                future_freq = freq_model.make_future_dataframe(periods=periods)
                freq_forecast = freq_model.predict(future_freq)
                results['frequency_forecast'] = {
                    'dates': freq_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                    'predicted': freq_forecast['yhat'].tolist(),
                    'lower_bound': freq_forecast['yhat_lower'].tolist(),
                    'upper_bound': freq_forecast['yhat_upper'].tolist()
                }
            
            return results
            
        except Exception as e:
            logger.error(f"Forecasting error: {e}")
            return {'error': str(e)}

class AnomalyDetector:
    """Anomaly detection using Isolation Forest"""
    
    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.models = {}
        self.scalers = {}
        self.feature_names = [
            'transaction_amount', 'time_since_last', 'counterparty_new',
            'fee_ratio', 'input_count', 'output_count', 'hour_of_day',
            'day_of_week', 'amount_deviation', 'frequency_deviation'
        ]
    
    def extract_anomaly_features(self, transaction: Dict, wallet_history: List[Dict]) -> np.ndarray:
        """Extract features for anomaly detection"""
        features = {}
        
        # Transaction amount
        features['transaction_amount'] = np.log10(max(transaction.get('amount', 1), 1))
        
        # Time since last transaction
        if wallet_history:
            last_tx_time = max(tx.get('timestamp', 0) for tx in wallet_history)
            features['time_since_last'] = transaction.get('timestamp', 0) - last_tx_time
        else:
            features['time_since_last'] = 0
        
        # New counterparty indicator
        known_counterparties = set(tx.get('counterparty', '') for tx in wallet_history)
        features['counterparty_new'] = 1 if transaction.get('counterparty', '') not in known_counterparties else 0
        
        # Fee ratio
        amount = transaction.get('amount', 1)
        fee = transaction.get('fee', 0)
        features['fee_ratio'] = fee / amount if amount > 0 else 0
        
        # Input/output counts
        features['input_count'] = transaction.get('input_count', 1)
        features['output_count'] = transaction.get('output_count', 1)
        
        # Temporal features
        tx_time = datetime.fromtimestamp(transaction.get('timestamp', 0))
        features['hour_of_day'] = tx_time.hour
        features['day_of_week'] = tx_time.weekday()
        
        # Deviation from historical patterns
        if wallet_history:
            historical_amounts = [tx.get('amount', 0) for tx in wallet_history]
            historical_times = [tx.get('timestamp', 0) for tx in wallet_history]
            
            if historical_amounts:
                mean_amount = np.mean(historical_amounts)
                features['amount_deviation'] = abs(amount - mean_amount) / (mean_amount + 1)
            else:
                features['amount_deviation'] = 0
            
            if len(historical_times) > 1:
                intervals = np.diff(sorted(historical_times))
                mean_interval = np.mean(intervals)
                current_interval = features['time_since_last']
                features['frequency_deviation'] = abs(current_interval - mean_interval) / (mean_interval + 1)
            else:
                features['frequency_deviation'] = 0
        else:
            features['amount_deviation'] = 0
            features['frequency_deviation'] = 0
        
        # Convert to numpy array
        feature_vector = np.array([features[name] for name in self.feature_names])
        return feature_vector.reshape(1, -1)
    
    def train_detector(self, wallet_address: str, transaction_history: List[Dict]) -> Dict[str, Any]:
        """Train Isolation Forest for specific wallet"""
        try:
            if len(transaction_history) < 10:
                return {'error': 'Insufficient data for training'}
            
            # Extract features for all historical transactions
            features_list = []
            for i, tx in enumerate(transaction_history):
                history_before = transaction_history[:i]  # Transactions before current
                features = self.extract_anomaly_features(tx, history_before)
                features_list.append(features[0])
            
            X = np.array(features_list)
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train Isolation Forest
            iso_forest = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100
            )
            iso_forest.fit(X_scaled)
            
            # Store model and scaler
            self.models[wallet_address] = iso_forest
            self.scalers[wallet_address] = scaler
            
            # Calculate baseline anomaly scores
            anomaly_scores = iso_forest.decision_function(X_scaled)
            outliers = iso_forest.predict(X_scaled)
            
            return {
                'model_trained': True,
                'training_samples': len(X),
                'anomalies_detected': int(np.sum(outliers == -1)),
                'anomaly_rate': float(np.mean(outliers == -1)),
                'score_statistics': {
                    'mean': float(np.mean(anomaly_scores)),
                    'std': float(np.std(anomaly_scores)),
                    'min': float(np.min(anomaly_scores)),
                    'max': float(np.max(anomaly_scores))
                }
            }
            
        except Exception as e:
            logger.error(f"Anomaly detector training error: {e}")
            return {'error': str(e)}
    
    def detect_anomaly(self, wallet_address: str, transaction: Dict, wallet_history: List[Dict]) -> Dict[str, Any]:
        """Detect if transaction is anomalous"""
        try:
            model = self.models.get(wallet_address)
            scaler = self.scalers.get(wallet_address)
            
            if not model or not scaler:
                return {'error': 'Model not trained for this wallet'}
            
            # Extract features
            features = self.extract_anomaly_features(transaction, wallet_history)
            features_scaled = scaler.transform(features)
            
            # Predict anomaly
            anomaly_score = model.decision_function(features_scaled)[0]
            is_anomaly = model.predict(features_scaled)[0] == -1
            
            # Calculate risk level
            risk_level = self._calculate_anomaly_risk(anomaly_score, is_anomaly)
            
            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(anomaly_score),
                'risk_level': risk_level,
                'confidence': float(abs(anomaly_score)),
                'features': {
                    name: float(val) for name, val in 
                    zip(self.feature_names, features[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return {'error': str(e)}
    
    def _calculate_anomaly_risk(self, score: float, is_anomaly: bool) -> str:
        """Calculate risk level based on anomaly score"""
        if not is_anomaly:
            return 'low'
        
        if score < -0.5:
            return 'critical'
        elif score < -0.3:
            return 'high'
        elif score < -0.1:
            return 'medium'
        else:
            return 'low'

class AIOrchestrator:
    """Main orchestrator for AI microservice"""
    
    def __init__(self):
        self.classifier = WalletBehaviorClassifier()
        self.forecaster = TimeSeriesForecaster()
        self.anomaly_detector = AnomalyDetector()
        self.groq_client = None
        self.fal_client = None
    
    async def initialize_ai_clients(self):
        """Initialize Groq and Fal clients"""
        try:
            # Initialize Groq client (assuming API key is in environment)
            import os
            groq_api_key = os.getenv('GROQ_API_KEY')
            if groq_api_key:
                from groq import Groq
                self.groq_client = Groq(api_key=groq_api_key)
                logger.info("Groq client initialized")
            
            # Initialize Fal client
            fal_api_key = os.getenv('FAL_KEY')
            if fal_api_key:
                import fal_client
                self.fal_client = fal_client
                logger.info("Fal client initialized")
                
        except Exception as e:
            logger.error(f"AI client initialization error: {e}")
    
    async def analyze_wallet_comprehensive(self, wallet_address: str, wallet_data: Dict) -> Dict[str, Any]:
        """Comprehensive wallet analysis using all AI models"""
        try:
            results = {
                'wallet_address': wallet_address,
                'analysis_timestamp': datetime.now().isoformat(),
                'models_used': []
            }
            
            # 1. Entity Classification
            classification = self.classifier.predict(wallet_data)
            results['classification'] = classification
            results['models_used'].append('wallet_classifier')
            
            # 2. Time Series Forecasting
            transaction_history = wallet_data.get('transaction_history', [])
            if len(transaction_history) >= 10:
                forecast_results = self.forecaster.forecast(wallet_address)
                results['forecasting'] = forecast_results
                results['models_used'].append('prophet_forecaster')
            
            # 3. Anomaly Detection for recent transactions
            recent_transactions = transaction_history[-10:]  # Last 10 transactions
            anomaly_results = []
            
            for tx in recent_transactions:
                anomaly_result = self.anomaly_detector.detect_anomaly(
                    wallet_address, tx, transaction_history
                )
                anomaly_results.append(anomaly_result)
            
            results['anomaly_detection'] = {
                'recent_transactions_analyzed': len(anomaly_results),
                'anomalies_found': sum(1 for r in anomaly_results if r.get('is_anomaly', False)),
                'details': anomaly_results
            }
            results['models_used'].append('isolation_forest')
            
            # 4. AI-Generated Insights using Groq
            if self.groq_client:
                insights = await self._generate_ai_insights(results)
                results['ai_insights'] = insights
                results['models_used'].append('groq_llm')
            
            # 5. Risk Assessment Summary
            results['risk_summary'] = self._calculate_comprehensive_risk(results)
            
            return results
            
        except Exception as e:
            logger.error(f"Comprehensive analysis error: {e}")
            return {'error': str(e)}
    
    async def _generate_ai_insights(self, analysis_results: Dict) -> Dict[str, Any]:
        """Generate AI insights using Groq"""
        try:
            # Prepare context for Groq
            context = f"""
            Wallet Analysis Results:
            - Entity Type: {analysis_results.get('classification', {}).get('entity_type', 'unknown')}
            - Confidence: {analysis_results.get('classification', {}).get('confidence', 0):.2f}
            - Risk Score: {analysis_results.get('classification', {}).get('risk_score', 0):.2f}
            - Anomalies Found: {analysis_results.get('anomaly_detection', {}).get('anomalies_found', 0)}
            
            Please provide insights about this wallet's behavior, potential risks, and recommendations.
            """
            
            response = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a blockchain analytics expert specializing in Bitcoin wallet behavior analysis."},
                    {"role": "user", "content": context}
                ],
                model="mixtral-8x7b-32768",
                temperature=0.3,
                max_tokens=500
            )
            
            insights_text = response.choices[0].message.content
            
            return {
                'summary': insights_text,
                'generated_at': datetime.now().isoformat(),
                'model_used': 'groq_mixtral'
            }
            
        except Exception as e:
            logger.error(f"AI insights generation error: {e}")
            return {'error': str(e)}
    
    def _calculate_comprehensive_risk(self, analysis_results: Dict) -> Dict[str, Any]:
        """Calculate comprehensive risk score"""
        try:
            # Base risk from classification
            classification_risk = analysis_results.get('classification', {}).get('risk_score', 0.5)
            
            # Anomaly risk
            anomaly_data = analysis_results.get('anomaly_detection', {})
            anomaly_count = anomaly_data.get('anomalies_found', 0)
            total_analyzed = anomaly_data.get('recent_transactions_analyzed', 1)
            anomaly_risk = min(anomaly_count / total_analyzed, 1.0)
            
            # Combine risks
            combined_risk = (classification_risk * 0.6 + anomaly_risk * 0.4)
            
            # Determine risk level
            if combined_risk > 0.8:
                risk_level = 'critical'
            elif combined_risk > 0.6:
                risk_level = 'high'
            elif combined_risk > 0.4:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'overall_risk_score': float(combined_risk),
                'risk_level': risk_level,
                'components': {
                    'classification_risk': float(classification_risk),
                    'anomaly_risk': float(anomaly_risk)
                },
                'recommendations': self._get_risk_recommendations(risk_level)
            }
            
        except Exception as e:
            logger.error(f"Risk calculation error: {e}")
            return {'error': str(e)}
    
    def _get_risk_recommendations(self, risk_level: str) -> List[str]:
        """Get recommendations based on risk level"""
        recommendations = {
            'critical': [
                "Immediate investigation required",
                "Consider blocking transactions",
                "Enhanced monitoring recommended",
                "Compliance review necessary"
            ],
            'high': [
                "Increased monitoring recommended",
                "Additional verification may be required",
                "Review transaction patterns",
                "Consider enhanced due diligence"
            ],
            'medium': [
                "Regular monitoring sufficient",
                "Periodic review recommended",
                "Watch for pattern changes"
            ],
            'low': [
                "Standard monitoring adequate",
                "No immediate action required"
            ]
        }
        
        return recommendations.get(risk_level, ["Standard monitoring recommended"])

# Example usage and testing
if __name__ == "__main__":
    async def main():
        # Initialize AI orchestrator
        orchestrator = AIOrchestrator()
        await orchestrator.initialize_ai_clients()
        
        # Mock wallet data for testing
        mock_wallet_data = {
            'wallet_address': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            'transaction_count': 150,
            'total_volume': 50.5,
            'activity_span_days': 365,
            'counterparties': ['addr1', 'addr2', 'addr3'] * 20,
            'transaction_timestamps': [1640995200 + i * 86400 for i in range(150)],
            'transactions': [
                {
                    'amount': 1.5 * (1 + 0.1 * i),
                    'timestamp': 1640995200 + i * 86400,
                    'input_count': 1,
                    'output_count': 2,
                    'fee': 0.0001,
                    'counterparty': f'addr{i % 10}'
                }
                for i in range(150)
            ],
            'transaction_history': [
                {
                    'timestamp': 1640995200 + i * 86400,
                    'volume': 1.5 * (1 + 0.1 * i),
                    'amount': 1.5 * (1 + 0.1 * i)
                }
                for i in range(150)
            ]
        }
        
        # Run comprehensive analysis
        print("Running comprehensive wallet analysis...")
        results = await orchestrator.analyze_wallet_comprehensive(
            'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            mock_wallet_data
        )
        
        print(json.dumps(results, indent=2, default=str))
    
    # Run the example
    asyncio.run(main())
