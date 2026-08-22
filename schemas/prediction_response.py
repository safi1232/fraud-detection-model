from pydantic import BaseModel, Field
from typing import Dict


class PredictionResponse(BaseModel):

    TransactionID: str = Field(
        ...,
        description="Unique ID of the transaction",
        examples=["TXN1000000"]
    )

    prediction: Dict[str, object] = Field(
        ...,
        description="Prediction details including predicted fraud class, confidence score, and probability distribution",
        examples=[
            {
                "predicted": 1,
                "confidence": 0.92,
                "output_probability": {
                    "0": 0.08,
                    "1": 0.92
                }
            }
        ]
    )