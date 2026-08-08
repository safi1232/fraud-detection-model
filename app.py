from fastapi import FastAPI
from model.predict import predict_output, model, MODEL_VERSION
from schemas.prediction_response import PredictionResponse
from schemas.user_input import UserInput


app = FastAPI(
    title="Fraud Detection API",
    description="API for detecting fraudulent transactions using a machine learning model",
    version=MODEL_VERSION
)


@app.get("/")
def home():
    return {
        "message": "Fraud Detection API",
        "status": "ok"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": MODEL_VERSION,
        "model_loaded": model is not None
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(user_input: UserInput):

    # Convert Pydantic object to dictionary
    user_data = user_input.model_dump()

    # Make prediction
    prediction = predict_output(user_data)

    return PredictionResponse(
        TransactionID=user_data["TransactionID"],
        prediction=prediction
    )