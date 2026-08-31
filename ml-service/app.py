from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from prediction import predict_risk,explain_prediction
from gemini_service import ask_historical_question
from early_warning import generate_early_warning
from historical_intelligence import find_upcoming_events


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

class HistoricalQuestion(BaseModel):
    question: str
    well_ids: list[str] = []

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

@app.post("/historical-intelligence")
def historical_intelligence(data: HistoricalQuestion):
    answer = ask_historical_question(
        question=data.question,
        well_ids=data.well_ids
    )
    return {
        "question": data.question,
        "well_ids": data.well_ids,
        "answer": answer
    }

class EarlyWarningRequest(BaseModel):
    drilling_data: DrillingData
    nearby_well_ids: list[str]
    lookahead: float = 100

@app.post("/early-warning")
def early_warning(request: EarlyWarningRequest):
    # Step 1: Get risk predictions using existing model
    df = pd.DataFrame([request.drilling_data.dict()])
    risk_result = predict_risk(df)

    mud_loss_risk = risk_result["Mud_Loss_Label"]["probability"]
    stuck_pipe_risk = risk_result["Stuck_Pipe_Label"]["probability"]
    kick_risk = risk_result["Kick_Label"]["probability"]

    # Step 2: Find historical events in nearby wells, ahead of current depth
    historical_events = find_upcoming_events(
        current_depth=request.drilling_data.Depth_MD,
        nearby_well_ids=request.nearby_well_ids,
        lookahead=request.lookahead,
        formation=request.drilling_data.Formation
    )

    # Step 3: Combine into final warning
    result = generate_early_warning(
        mud_loss_risk=mud_loss_risk,
        stuck_pipe_risk=stuck_pipe_risk,
        kick_risk=kick_risk,
        historical_events=historical_events
    )

    return result