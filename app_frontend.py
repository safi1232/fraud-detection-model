
import streamlit as st
import requests


# ---------------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------------

st.set_page_config(
    page_title="Fraud Detection",
    page_icon="🛡️",
    layout="wide"
)


# ---------------------------------------------------------
# CUSTOM CSS
# ---------------------------------------------------------

st.markdown(
    """
    <style>
        .main {
            padding-top: 2rem;
        }

        .title {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .subtitle {
            font-size: 18px;
            color: #777;
            margin-bottom: 30px;
        }

        .result-box {
            padding: 25px;
            border-radius: 15px;
            margin-top: 20px;
            text-align: center;
        }

        .fraud {
            background-color: #ffe5e5;
            border: 2px solid #ff4b4b;
        }

        .safe {
            background-color: #e5ffe9;
            border: 2px solid #21c45b;
        }

        .result-title {
            font-size: 32px;
            font-weight: 700;
        }

        .confidence {
            font-size: 20px;
            margin-top: 10px;
        }
    </style>
    """,
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# API CONFIG
# ---------------------------------------------------------

API_URL = "https://fraud-detection-model.fastapicloud.dev/predict"


# ---------------------------------------------------------
# HEADER
# ---------------------------------------------------------

st.markdown(
    '<div class="title">🛡️ Fraud Detection System</div>',
    unsafe_allow_html=True
)

st.markdown(
    '<div class="subtitle">AI-powered transaction fraud detection using AdaBoost</div>',
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# TRANSACTION INFORMATION
# ---------------------------------------------------------

st.header("Transaction Information")

col1, col2, col3 = st.columns(3)

with col1:
    transaction_id = st.text_input(
        "Transaction ID",
        value="TXN1000000"
    )

    amount = st.number_input(
        "Transaction Amount",
        min_value=0.0,
        value=89.72,
        step=0.01
    )

    hour = st.number_input(
        "Transaction Hour",
        min_value=0,
        max_value=23,
        value=16,
        step=1
    )

    day_of_week = st.number_input(
        "Day of Week",
        min_value=0,
        max_value=6,
        value=4,
        step=1
    )

    merchant_category = st.selectbox(
        "Merchant Category",
        [
            "Electronics",
            "Grocery",
            "Clothing",
            "Restaurant",
            "Travel",
            "Entertainment",
            "Healthcare",
            "Other"
        ]
    )

with col2:
    payment_method = st.selectbox(
        "Payment Method",
        [
            "Credit Card",
            "Debit Card",
            "Bank Transfer",
            "Cash",
            "Digital Wallet"
        ]
    )

    device_type = st.selectbox(
        "Device Type",
        [
            "Mobile",
            "Desktop",
            "Tablet"
        ]
    )

    country = st.text_input(
        "Country",
        value="Pakistan"
    )

    account_age_days = st.number_input(
        "Account Age (Days)",
        min_value=0,
        value=450,
        step=1
    )

    previous_transactions = st.number_input(
        "Previous Transactions",
        min_value=0,
        value=35,
        step=1
    )

with col3:
    average_transaction_amount = st.number_input(
        "Average Transaction Amount",
        min_value=0.0,
        value=125.50,
        step=0.01
    )

    transactions_last_24h = st.number_input(
        "Transactions Last 24H",
        min_value=0,
        value=3,
        step=1
    )

    failed_transactions_last_24h = st.number_input(
        "Failed Transactions Last 24H",
        min_value=0,
        value=1,
        step=1
    )

    is_international = st.selectbox(
        "International Transaction",
        [0, 1],
        format_func=lambda x: "Yes" if x == 1 else "No"
    )

    distance_from_home = st.number_input(
        "Distance From Home (Km)",
        min_value=0.0,
        value=12.5,
        step=0.1
    )


# ---------------------------------------------------------
# RISK INFORMATION
# ---------------------------------------------------------

st.header("Risk & Device Information")

col1, col2, col3 = st.columns(3)

with col1:
    device_change = st.selectbox(
        "Device Changed",
        [0, 1],
        format_func=lambda x: "Yes" if x == 1 else "No"
    )

with col2:
    ip_risk_score = st.number_input(
        "IP Risk Score",
        min_value=0.0,
        max_value=100.0,
        value=33.57,
        step=0.01
    )

with col3:
    merchant_risk_score = st.number_input(
        "Merchant Risk Score",
        min_value=0.0,
        max_value=100.0,
        value=14.56,
        step=0.01
    )


# ---------------------------------------------------------
# PREDICTION
# ---------------------------------------------------------

st.markdown("---")

predict_button = st.button(
    "🔍 Detect Fraud",
    use_container_width=True,
    type="primary"
)


if predict_button:

    # Build request payload
    payload = {
        "TransactionID": transaction_id,
        "Amount": amount,
        "Hour": hour,
        "DayOfWeek": day_of_week,
        "MerchantCategory": merchant_category,
        "PaymentMethod": payment_method,
        "DeviceType": device_type,
        "Country": country,
        "AccountAgeDays": account_age_days,
        "PreviousTransactions": previous_transactions,
        "AverageTransactionAmount": average_transaction_amount,
        "TransactionsLast24H": transactions_last_24h,
        "FailedTransactionsLast24H": failed_transactions_last_24h,
        "IsInternational": is_international,
        "DistanceFromHomeKm": distance_from_home,
        "DeviceChange": device_change,
        "IPRiskScore": ip_risk_score,
        "MerchantRiskScore": merchant_risk_score
    }

    try:

        with st.spinner("Analyzing transaction..."):

            response = requests.post(
                API_URL,
                json=payload,
                timeout=30
            )

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        if response.status_code == 200:

            result = response.json()

            prediction_data = result["prediction"]

            predicted = prediction_data["predicted"]
            confidence = prediction_data["confidence"]
            probabilities = prediction_data["output_probability"]

            # Fraud = 1
            if predicted == 1:

                st.markdown(
                    f"""
                    <div class="result-box fraud">
                        <div class="result-title">
                            🚨 FRAUDULENT TRANSACTION
                        </div>
                        <div class="confidence">
                            Confidence: {confidence * 100:.2f}%
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            # Legitimate = 0
            else:

                st.markdown(
                    f"""
                    <div class="result-box safe">
                        <div class="result-title">
                            ✅ LEGITIMATE TRANSACTION
                        </div>
                        <div class="confidence">
                            Confidence: {confidence * 100:.2f}%
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            # -------------------------------------------------
            # PROBABILITIES
            # -------------------------------------------------

            st.subheader("Prediction Probabilities")

            probability_columns = st.columns(len(probabilities))

            for column, (label, probability) in zip(
                probability_columns,
                probabilities.items()
            ):

                with column:

                    if str(label) == "1":
                        display_name = "Fraud"
                    else:
                        display_name = "Legitimate"

                    st.metric(
                        display_name,
                        f"{probability * 100:.2f}%"
                    )

                    st.progress(float(probability))


            # -------------------------------------------------
            # TRANSACTION DETAILS
            # -------------------------------------------------

            st.subheader("Transaction Details")

            col1, col2 = st.columns(2)

            with col1:
                st.write("**Transaction ID:**", transaction_id)
                st.write("**Amount:**", f"${amount:,.2f}")
                st.write("**Merchant:**", merchant_category)

            with col2:
                st.write("**Payment Method:**", payment_method)
                st.write("**Device:**", device_type)
                st.write("**Country:**", country)

        else:

            st.error(
                f"API Error {response.status_code}: {response.text}"
            )

    except requests.exceptions.ConnectionError:

        st.error(
            "❌ Could not connect to the FastAPI server. "
            "Make sure FastAPI is running on http://127.0.0.1:8000"
        )

    except requests.exceptions.Timeout:

        st.error(
            "⏱️ The API request timed out."
        )

    except Exception as e:

        st.error(
            f"Unexpected error: {str(e)}"
        )

