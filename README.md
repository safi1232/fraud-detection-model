# Fraud Detection Model

An end-to-end machine learning project for detecting potentially fraudulent transactions using Python and Scikit-learn.

## Overview

This project implements a machine learning pipeline to classify financial transactions as fraudulent or legitimate. It demonstrates the practical application of data preprocessing, exploratory data analysis, feature engineering, model development, evaluation, and deployment.

The trained model generates binary predictions:

- `0` — Legitimate Transaction
- `1` — Fraudulent Transaction

## Live Application

https://fraud-3lp.pages.dev/
# Alternate URL:https://fraud-detection-4xbuci1ma-acme-4a68.vercel.app/ 

## Key Features

- Data preprocessing and cleaning
- Missing-value handling
- Exploratory data analysis (EDA)
- Categorical encoding and numerical feature scaling
- Outlier handling and feature engineering
- Machine learning model training and evaluation
- Scikit-learn preprocessing and prediction pipeline
- Model serialization using Pickle
- Interactive fraud prediction interface
- API development using FastAPI and Pydantic

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| Pandas | Data manipulation and preprocessing |
| NumPy | Numerical computations |
| Scikit-learn | Model training, preprocessing, and evaluation |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| FastAPI | API development |
| Pydantic | Request validation |
| Uvicorn | ASGI server |
| Pickle | Model serialization |
| Streamlit | Interactive web application |

## Machine Learning Pipeline

```text
Raw Dataset
    ↓
Data Cleaning
    ↓
Exploratory Data Analysis
    ↓
Missing-Value Handling
    ↓
Categorical Encoding
    ↓
Feature Scaling
    ↓
Feature Engineering
    ↓
Train-Test Split
    ↓
Model Training
    ↓
Model Evaluation
    ↓
Model Serialization
    ↓
Deployment & Prediction
```

## Project Objectives

- Develop a machine learning solution for transaction fraud classification.
- Apply data preprocessing and feature engineering techniques.
- Build a consistent pipeline for transforming data and generating predictions.
- Evaluate model performance using relevant classification metrics.
- Deploy the trained model through an interactive web application.

## Repository Structure

```text
fraud-detection-model/
├── model/
│   └── pipe.pkl
├── app.py
├── helper.py
├── requirements.txt
├── README.md
└── frontend/
    └── fraudguard-frontend/
```

*The repository structure above is illustrative; filenames and directories may vary depending on the current project version.*

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/safi1232/fraud-detection-model.git
cd fraud-detection-model
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

For a Streamlit application:

```bash
streamlit run app.py
```

For a FastAPI backend, if configured as the project's entry point:

```bash
uvicorn app:app --reload
```

Use the command corresponding to the application you want to run.

## Author

**Safi**

GitHub: [@safi1232](https://github.com/safi1232)
