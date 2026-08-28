import pandas as pd
import numpy as np
import joblib
import shap
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import os


script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "datasets", "drilling_timeseries_balanced.csv")
df = pd.read_csv(csv_path)
print("Dataset shape:", df.shape)

# Convert Timestamp

df["Timestamp"] = pd.to_datetime(df["Timestamp"])

df["Hour"] = df["Timestamp"].dt.hour
df["Day"] = df["Timestamp"].dt.day
df["Month"] = df["Timestamp"].dt.month

# Remove original timestamp
df = df.drop(columns=["Timestamp"])

# Encode Categorical Columns

# Find all text columns
categorical_columns = df.select_dtypes(
    include=["object"]
).columns.tolist()

# Well_ID is an identifier, not a useful ML feature
if "Well_ID" in categorical_columns:
    categorical_columns.remove("Well_ID")

print("Categorical columns:", categorical_columns)

# One-hot encode all categorical columns
df = pd.get_dummies(
    df,
    columns=categorical_columns,
    drop_first=True
)


# Define Target Columns

target_columns = [
    "Mud_Loss_Label",
    "Stuck_Pipe_Label",
    "Kick_Label"
]
# Create X and Y

# Well_ID is only an identifier.
# It should NOT be used by the ML model.

X = df.drop(
    columns=target_columns + ["Well_ID"]
)

y = df[target_columns]


print("\nFeatures:", X.shape[1])
print("Targets:", target_columns)


#  Train-Test Split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


#  Train Separate Random Forest Models

models = {}

for target in target_columns:

    print("\nTraining:", target)

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )

    model.fit(
        X_train,
        y_train[target]
    )

    models[target] = model


#  Evaluate Models

print("\n")
print("=" * 60)
print("MODEL EVALUATION")
print("=" * 60)


for target in target_columns:

    model = models[target]

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test[target],
        predictions
    )

    print("\n", target)
    print("-" * 40)

    print("Accuracy:", round(accuracy, 4))

    print(
        classification_report(
            y_test[target],
            predictions,
            digits=4
        )
    )


# Save Models

joblib.dump(
    models,
    os.path.join(script_dir, "drilling_risk_models.pkl")
)

joblib.dump(
    X.columns.tolist(),
    os.path.join(script_dir, "feature_columns.pkl")
)


print("\nModels saved successfully!")


#  SHAP Explainability
# Create SHAP explainers for each model

explainers = {}

for target in target_columns:

    explainers[target] = shap.TreeExplainer(
        models[target]
    )


joblib.dump(
    explainers,
    os.path.join(script_dir,"shap_explainers.pkl")   
)

print("SHAP explainers saved successfully!")