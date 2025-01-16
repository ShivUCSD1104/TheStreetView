import yfinance as yf
import pandas as pd
import numpy as np

def get_yield_data(start_date, end_date):
  tickers = {
  "^IRX": "3-Month",  # 13 Week T-Bill (proxy for 3-month)
  "^FVX": "5-Year",   # 5-Year T-Note
  "^TNX": "10-Year",  # 10-Year T-Note
  "^TYX": "30-Year",  # 30-Year T-Bond
  }

  # Step 2: Fetch data for the past 6 months
  data = {}
  for ticker, label in tickers.items():
      try:
          # Download the data and extract adjusted close prices
          df = yf.download(ticker, start="2024-07-01", end="2025-01-01")
          if not df.empty:  # Ensure the data is valid
              data[label] = df["Adj Close"]
          else:
              print(f"No data available for {label} ({ticker})")
      except Exception as e:
          print(f"Failed to download data for {label} ({ticker}): {e}")


  #create a new dataframe called yield data and set the index to the date column
  mat = 30
  yield_data = pd.DataFrame(columns=['Date','Maturity','Yield'])
  for k,v in data.items():
      if k == "3-Month":
          mat = 3
      elif k == "5-Year":
          mat = 60
      elif k == "10-Year":
          mat = 120
      elif k == "30-Year":
          mat = 360
      for _,row in v.iterrows():
          df2 = pd.DataFrame([[row.name,mat,row[0]]], columns=['Date','Maturity','Yield'])
          yield_data = pd.concat([yield_data, df2])

  yield_data.set_index('Date', inplace=True)
  yield_data.index = pd.to_datetime(yield_data.index)

  # Pivot the yield_data DataFrame for easier plotting
  pivot_yield_data = yield_data.reset_index().pivot(index='Date', columns='Maturity', values='Yield')

  # Ensure maturities are in the correct order
  pivot_yield_data = pivot_yield_data[[3, 60, 120, 360]]  # Align with maturities in months

  # Extract the z-axis (yield values), x-axis (maturities), and y-axis (dates)
  z = pivot_yield_data.to_numpy()  # Yield values
  x = np.array([3, 60, 120, 360])  # Maturities in months
  y = pivot_yield_data.index  # Dates

  return x,y,z