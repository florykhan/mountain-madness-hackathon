from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from parser import parse_calendar_events
from prediction import predict_spending as run_prediction
app=FastAPI()

class CalendarEvent(BaseModel):
    title:str
    location: Optional[str]=None
    start_time:str
    attendees: Optional[int]=None

class PredictRequest(BaseModel):
    events: List[CalendarEvent]

class PredictResponse(BaseModel):
    predicted_total:float
    confidence:float
    breakdown:dict
    features:List[dict]=None

@app.get("/")
def read_root():
    return {"message": "working"}

@app.post("/predict", response_model=PredictResponse)
def predict(request:PredictRequest):
    eventdict=[event.model_dump() for event in request.events]
    features=parse_calendar_events(eventdict)
    result=run_prediction(features)

    return {
        "predicted_total":result["total_predicted"],
        "confidence":result["confidence"],
        "breakdown":result["breakdown"],
        "features":features
    }