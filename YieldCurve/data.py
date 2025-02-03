import yfinance as yf
import pandas as pd
import numpy as np

def get_yield_data(start_date, end_date):
    tickers = {
        "^IRX": "3-Month",
        "^FVX": "5-Year",
        "^TNX": "10-Year",
        "^TYX": "30-Year",
    }

    # Original working data retrieval logic
    data = {}
    for ticker, label in tickers.items():
        try:
            # Keep original date range that worked locally
            df = yf.download(ticker, start="2024-07-01", end="2025-01-01")
            if not df.empty:
                data[label] = df["Close"]
        except Exception as e:
            print(f"Error fetching {label} data: {str(e)}")
            continue

    # Original data processing logic
    yield_data = pd.DataFrame(columns=['Date','Maturity','Yield'])
    for k,v in data.items():
        mat = 3 if k == "3-Month" else 60 if k == "5-Year" else 120 if k == "10-Year" else 360
        for date, price in v.items():
            df2 = pd.DataFrame([[date, mat, price]], columns=['Date','Maturity','Yield'])
            yield_data = pd.concat([yield_data, df2])

    # Keep original pivoting logic
    yield_data.set_index('Date', inplace=True)
    pivot_yield_data = yield_data.reset_index().pivot(index='Date', columns='Maturity', values='Yield')
    pivot_yield_data = pivot_yield_data[[3, 60, 120, 360]]  # Maintain original order
    
    z = pivot_yield_data.to_numpy()
    x = np.array([3, 60, 120, 360])
    y = pivot_yield_data.index

    return x, y, z