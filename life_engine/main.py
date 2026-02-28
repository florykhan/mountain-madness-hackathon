from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from parser import parse_calendar_events
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
def predict_spending(request:PredictRequest):
    eventdict=[event.dict() for event in request.events]
    features=parse_calendar_events(eventdict)
    total=0
    for f in features:
        if f['event_type']=='meal':
            base=40 if f['time_category']=='evening' else 20
            total+=base+(f['attendees']*5 if f['attendees'] else 10)
        elif f['event_type']=='coffee':
            total += 8 * (f['attendees'] if f['attendees'] else 2)
        elif f['event_type']=='entertainment':
            total+=100
        elif f['event_type']=='transport':
            total+=25
        else:
            total+=15
    
    return {
        "predicted_total":total,
        "confidence":0.85,
        "breakdown":{
            "food":total*0.5,
            "entertainment":total*0.3,
            "transport":total*0.2
        },
        'features':features
    }