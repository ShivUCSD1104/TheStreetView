import yfinance as yf
from datetime import datetime
import numpy as np
import logging
from time import sleep

logger = logging.getLogger(__name__)

def get_risk_free_rate():
    """Get 3-month T-bill rate with fallback and validation"""
    try:
        tbill = yf.Ticker("^IRX")
        hist = tbill.history(period="1d")
        
        if hist.empty:
            logger.warning("No T-bill data, using fallback rate")
            return 0.04  # Fallback rate
        
        rate = hist["Close"].iloc[-1] / 100
        return max(min(rate, 0.15), 0.001)  # Cap between 0.1%-15%
    
    except Exception as e:
        logger.error(f"Error fetching risk-free rate: {str(e)}")
        return 0.04

def get_option_data(ticker_str, contract_type="calls"):
    """Get filtered option data with robust error handling"""
    try:
        ticker = yf.Ticker(ticker_str)
        expirations = ticker.options[:12]  # Get first 12 expirations
        stock_data = ticker.history(period="1d")
        
        if not expirations or stock_data.empty:
            raise ValueError("Missing option/stock data")
            
        S = stock_data["Close"].iloc[-1]
        valid_data = []
        now = datetime.now()
        
        logger.info(f"Processing {len(expirations)} expirations for {ticker_str}")
        
        for expiry in expirations:
            try:
                expiry_dt = datetime.strptime(expiry, "%Y-%m-%d")
                T = (expiry_dt - now).total_seconds() / (365*24*3600)
                
                # Keep expirations within 3 days to 1 year
                if T < 3/365 or T > 1:
                    continue
                
                # Retry logic for Yahoo Finance API
                for attempt in range(3):
                    try:
                        chain = ticker.option_chain(expiry)
                        break
                    except Exception as e:
                        if attempt == 2:
                            raise
                        sleep(1)
                
                df = chain.calls if contract_type == "calls" else chain.puts
                
                # More lenient filtering
                df = df[
                    (df['bid'] > 0) &
                    (df['ask'] > 0) &
                    (df['strike'] >= S * 0.3) &  # Wider strike range
                    (df['strike'] <= S * 3)
                ]
                
                if len(df) > 5:  # Minimum contracts per expiration
                    valid_data.append((df, T))
                    logger.info(f"Added {len(df)} {contract_type} for {expiry} (T={T:.2f}y)")
                    
            except Exception as e:
                logger.warning(f"Skipping {expiry}: {str(e)}")
                continue
        
        if not valid_data:
            raise ValueError(f"No valid {contract_type} data found for {ticker_str}")
        
        return valid_data, S
    
    except Exception as e:
        logger.error(f"Data sourcing failed: {str(e)}")
        raise ValueError(f"Could not retrieve data for {ticker_str}")