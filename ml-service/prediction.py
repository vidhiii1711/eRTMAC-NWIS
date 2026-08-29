import pandas as pd
import numpy as np
import joblib
import os
import shap

# Load Models
script_dir = os.path.dirname(os.path.abspath(__file__))
models = joblib.load(
    os.path.join(script_dir, "drilling_risk_models.pkl")
)
feature_columns = joblib.load(
    os.path.join(script_dir, "feature_columns.pkl")
)

# Risk Level Function
def get_risk_level(probability):
    if probability < 0.40:
        return "LOW"
    elif probability < 0.70:
        return "MEDIUM"
    else:
        return "HIGH"

# Prepare Input
def prepare_input(data):
    data = data.copy()
    
    # Timestamp processing
    if "Timestamp" in data.columns:
        data["Timestamp"] = pd.to_datetime(data["Timestamp"])
        data["Hour"] = data["Timestamp"].dt.hour
        data["Day"] = data["Timestamp"].dt.day
        data["Month"] = data["Timestamp"].dt.month
        data = data.drop(columns=["Timestamp"])
    
    # Remove ID
    if "Well_ID" in data.columns:
        data = data.drop(columns=["Well_ID"])
    
    # Encode categorical variables
    data = pd.get_dummies(
        data,
        columns=["Formation", "Bit_Type"],
        drop_first=True
    )
    
    # Make sure input has exactly the same columns
    data = data.reindex(columns=feature_columns, fill_value=0)
    
    return data

# Prediction Function
def predict_risk(input_data):
    X = prepare_input(input_data)
    results = {}
    for target, model in models.items():
        # Probability of class 1
        probability = model.predict_proba(X)[0][1]
        percentage = round(float(probability) * 100, 2)
        risk_level = get_risk_level(probability)
        results[target] = {
            "risk_level": risk_level,
            "probability": percentage
        }
    return results

# Explain Prediction
def explain_prediction(input_data):
    X = prepare_input(input_data)
    explanations = {}
    
    for target, model in models.items():
        # Create SHAP explainer
        explainer = shap.TreeExplainer(model)
        
        # Get SHAP values
        shap_values = explainer.shap_values(X.values)
        
        # For RandomForest binary classification:
        # shap_values shape is (n_samples, n_features, n_classes)
        # We want class 1 (positive class), first sample
        if isinstance(shap_values, list):
            # Old sklearn versions return list
            values = shap_values[1][0]
        else:
            # Newer sklearn versions return array
            values = shap_values[0, :, 1]  # First sample, all features, class 1
        
        # Get feature values from first row
        feature_values = X.iloc[0].values
        
        # Create explanation dataframe
        explanation_df = pd.DataFrame({
            "Feature": list(X.columns),
            "SHAP_Value": values,
            "Feature_Value": feature_values
        })
        
        explanation_df = explanation_df.sort_values(
        by="SHAP_Value",
        key=lambda x: x.abs(),
        ascending=False
        )
        
        top_features = explanation_df.head(5)
        explanations[target] = top_features
    
    return explanations