from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from prediction import predict_risk,explain_prediction

app = FastAPI()

class DrillingData(BaseModel):
    Well_ID: str
    Timestamp: str
    Depth_MD: float
    Depth_TVD: float
    Formation: str
    ROP: float
    WOB: float
    RPM: float
    Torque: float
    Standpipe_Pressure: float
    Flow_Rate: float
    Mud_Weight: float
    Plastic_Viscosity: float
    Yield_Point: float
    Hook_Load: float
    Inclination: float
    Bit_Type: str
    Reservoir_Pressure: float
    Formation_Pore_Pressure: float
    Distance_To_Nearest_Offset_m: float
    Historical_Event_Count: int

@app.post("/predict")
def make_prediction(data: DrillingData):
    df = pd.DataFrame([data.dict()])
    result = predict_risk(df)
    return result

@app.post("/explain")
def explain(data: DrillingData):
    df = pd.DataFrame([data.dict()])
    explanations = explain_prediction(df)
    
    # Convert to JSON-friendly format
    result = {}
    for target, df_explain in explanations.items():
        result[target] = df_explain.to_dict(orient="records")
    
    return result
