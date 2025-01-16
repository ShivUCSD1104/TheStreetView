import yfinance as yf
from datetime import datetime

#Get the risk-free rate using the 3-month T-bill
def get_risk_free_rate():
    """
    Fetches the 3-month T-bill (annualized) yield from yfinance
    using the '^IRX' ticker. You can switch to a different T-Bill
    if you prefer e.g. '^IRX' -> 3-month, '^FVX' -> 5-year, etc.
    
    Returns the yield in decimal form (e.g. 0.045 => 4.5%).
    """
    tbill = yf.Ticker("^IRX")  # 13-week T-bill index on Yahoo
    hist = tbill.history(period="1d")
    if hist.empty:
        # Fallback if no data
        return 0.042
    
    # ^IRX is often quoted in basis points or %; typically it's in hundredths
    last_close = hist["Close"].iloc[-1]
    # Convert to decimal form (e.g. 4.5 => 0.045)
    r_decimal = last_close / 100.0
    return r_decimal


def get_option_data(ticker_str, contract_type="calls"):
    """
    Retrieves up to 3 option chain DataFrames (calls or puts) for a given ticker's earliest expirations.
    
    contract_type: 'calls' or 'puts'
    Returns:
      - A list of tuples: [(options_df, T), (options_df, T), (options_df, T)] for up to 3 expirations
      - Underlying spot price S
    """
    ticker = yf.Ticker(ticker_str)
    
    # Get all available expiration dates
    expirations = ticker.options
    if not expirations:
        raise ValueError(f"No option data available for ticker {ticker_str}.")
    
    # Select up to the first 36 expiration dates
    selected_expirations = expirations[:12]
    
    # Get current underlying price
    stock_data = ticker.history(period="1d")
    if stock_data.empty:
        raise ValueError("Could not retrieve stock price history.")
    S = stock_data["Close"].iloc[-1]
    
    # Build a list of (DataFrame, T) for each of the selected expirations
    data_list = []
    now = datetime.now()
    
    for expiry_date in selected_expirations:
        chain = ticker.option_chain(expiry_date)
        if contract_type == "calls":
            options_df = chain.calls
        elif contract_type == "puts":
            options_df = chain.puts
        else:
            raise ValueError("contract_type must be either 'calls' or 'puts'.")
        
        expiry_dt = datetime.strptime(expiry_date, "%Y-%m-%d")
        T = (expiry_dt - now).days / 365.0
        
        # Skip if T <= 0
        if T > 0:
            data_list.append((options_df, T))
    
    return data_list, S


