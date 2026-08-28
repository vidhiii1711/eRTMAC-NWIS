import pandas as pd
from prediction import predict_risk, explain_prediction,prepare_input
import joblib

# Create sample input matching your training data
test_data = pd.DataFrame(
    {
    "Well_ID": ["W043"],
    "Timestamp": ["02-03-2026 05:30"],
    "Depth_MD": [2273.4],
    "Depth_TVD": [2256.64],
    "Formation": ["Limestone"],
    "ROP": [12.471758],
    "WOB": [45.729812],
    "RPM": [96.420749],
    "Torque": [254.13504],
    "Standpipe_": [397.3671],
    "Flow_Rate": [924.32535],
    "Mud_Weight": [1.3648994],
    "Plastic_Vis": [22.920194],
    "Yield_Point": [8.3836301],
    "Hook_Load": [255.69656],
    "Inclination": [2.294179],
    "Bit_Type": ["TriCone_8."],
    "Reservoir_": [4891.792],
    "Formation_": [4945.6783],
    "Distance_l": [24025.644]
}
)

# Test 1: Basic prediction
print("=" * 50)
print("TEST 1: PREDICTION")
print("=" * 50)
try:
    result = predict_risk(test_data)
    print("✓ Prediction successful")
    print(result)
except Exception as e:
    print(f"✗ Prediction failed: {e}")

# Test 2: Explanation
print("\n" + "=" * 50)
print("TEST 2: EXPLANATION")
print("=" * 50)
try:
    explanation = explain_prediction(test_data)
    print("✓ Explanation successful")
    for target, top_features in explanation.items():
        print(f"\n{target}:")
        print(top_features)
except Exception as e:
    print(f"✗ Explanation failed: {e}")

