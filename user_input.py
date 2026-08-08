from pydantic import BaseModel, Field
from typing import Annotated


class UserInput(BaseModel):

    TransactionID: Annotated[
        str,
        Field(
            ...,
            description="Unique transaction ID",
            examples=["TXN1000000"]
        )
    ]

    Amount: Annotated[
        float,
        Field(
            ...,
            description="Transaction amount",
            examples=[89.72]
        )
    ]

    Hour: Annotated[
        int,
        Field(
            ...,
            description="Hour of the transaction",
            examples=[16]
        )
    ]

    DayOfWeek: Annotated[
        int,
        Field(
            ...,
            description="Day of the week",
            examples=[4]
        )
    ]

    MerchantCategory: Annotated[
        str,
        Field(
            ...,
            description="Category of the merchant",
            examples=["Electronics"]
        )
    ]

    PaymentMethod: Annotated[
        str,
        Field(
            ...,
            description="Payment method used for the transaction",
            examples=["Credit Card"]
        )
    ]

    DeviceType: Annotated[
        str,
        Field(
            ...,
            description="Device used for the transaction",
            examples=["Mobile"]
        )
    ]

    Country: Annotated[
        str,
        Field(
            ...,
            description="Country where the transaction occurred",
            examples=["Pakistan"]
        )
    ]

    AccountAgeDays: Annotated[
        int,
        Field(
            ...,
            description="Age of the account in days",
            examples=[450]
        )
    ]

    PreviousTransactions: Annotated[
        int,
        Field(
            ...,
            description="Number of previous transactions",
            examples=[35]
        )
    ]

    AverageTransactionAmount: Annotated[
        float,
        Field(
            ...,
            description="Average transaction amount",
            examples=[125.50]
        )
    ]

    TransactionsLast24H: Annotated[
        int,
        Field(
            ...,
            description="Number of transactions in the last 24 hours",
            examples=[3]
        )
    ]

    FailedTransactionsLast24H: Annotated[
        int,
        Field(
            ...,
            description="Number of failed transactions in the last 24 hours",
            examples=[1]
        )
    ]

    IsInternational: Annotated[
        int,
        Field(
            ...,
            description="Whether the transaction is international (0 = No, 1 = Yes)",
            examples=[0]
        )
    ]

    DistanceFromHomeKm: Annotated[
        float,
        Field(
            ...,
            description="Distance from user's home in kilometers",
            examples=[12.5]
        )
    ]

    DeviceChange: Annotated[
        int,
        Field(
            ...,
            description="Whether the user changed their device (0 = No, 1 = Yes)",
            examples=[0]
        )
    ]

    IPRiskScore: Annotated[
        float,
        Field(
            ...,
            description="IP address risk score",
            examples=[33.57]
        )
    ]

    MerchantRiskScore: Annotated[
        float,
        Field(
            ...,
            description="Merchant risk score",
            examples=[14.56]
        )
    ]