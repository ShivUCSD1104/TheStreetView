import databento as db
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from utils import create_orderbook

def get_data(ticker='TSLA', days=7):
  client = db.Historical("db-QNue9tcjaXcJGDXRTMnSPAvrF8V7c")

  #start_date a week from today
  start_date = datetime.now() - timedelta(days=days)
  #end date yesterday
  end_date = datetime.now() - timedelta(days=1)
  symbols = [ticker]

  df = client.timeseries.get_range(
      dataset="XNAS.ITCH",
      schema="mbp-10",
      symbols=symbols,
      start=start_date,
      end=end_date,
      limit=10_000,
  ).to_df()

  apx, bpx, avc, bvc, times = create_orderbook(df)
  return apx, bpx, avc, bvc, times




