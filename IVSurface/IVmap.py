import numpy as np
from scipy.interpolate import griddata
import logging
from .BSMCompute import compute_implied_vols

logger = logging.getLogger(__name__)

def generate_iv_surface(ticker_symbol):
    """Generate implied volatility surface data for Three.js visualization"""
    try:
        logger.info(f"Generating IV surface for {ticker_symbol}")
        
        # Get and process calls data
        ivs_calls, mny_calls, ttes_calls = compute_implied_vols(ticker_symbol, "calls")
        filtered_calls = [
            (iv, m, tte) 
            for iv, m, tte in zip(ivs_calls, mny_calls, ttes_calls)
            if 0.3 <= m <= 3  # Wider moneyness range for web visualization
        ]
        
        # Get and process puts data
        ivs_puts, mny_puts, ttes_puts = compute_implied_vols(ticker_symbol, "puts")
        filtered_puts = [
            (iv, m, tte)
            for iv, m, tte in zip(ivs_puts, mny_puts, ttes_puts)
            if 0.3 <= m <= 3
        ]

        # Combine filtered data
        ivs = []
        mny = []
        ttes = []
        
        if filtered_calls:
            calls_iv, calls_mny, calls_tte = zip(*filtered_calls)
            ivs.extend(calls_iv)
            mny.extend(calls_mny)
            ttes.extend(calls_tte)
            
        if filtered_puts:
            puts_iv, puts_mny, puts_tte = zip(*filtered_puts)
            ivs.extend(puts_iv)
            mny.extend(puts_mny)
            ttes.extend(puts_tte)

        # Convert to numpy arrays
        ivs = np.array(ivs)
        mny = np.array(mny)
        ttes = np.array(ttes)

        # Data validation
        if len(ivs) < 20:
            raise ValueError(f"Insufficient data points ({len(ivs)}) for surface generation")

        # Create grid
        grid_x, grid_y = np.meshgrid(
            np.linspace(min(mny), max(mny), 100),
            np.linspace(min(ttes), max(ttes), 100)
        )

        # Interpolation with edge handling
        grid_z = griddata((mny, ttes), ivs, (grid_x, grid_y), method='cubic')
        grid_z = np.nan_to_num(grid_z, nan=0.0)
        grid_z = np.clip(grid_z, 0, 5)  # Cap IV between 0-500%

        return {
            "grid_mny": grid_x.tolist(),
            "grid_ttes": grid_y.tolist(),
            "grid_ivs": grid_z.tolist(),
            "bounds": {
                "x": [float(np.min(mny)), float(np.max(mny))],
                "y": [float(np.min(ttes)), float(np.max(ttes))],
                "z": [float(np.min(grid_z)), float(np.max(grid_z))]
            },
            "ticker": ticker_symbol
        }
        
    except Exception as e:
        logger.error(f"Error generating IV surface: {str(e)}")
        return {
            "error": str(e),
            "bounds": {"x": [0,1], "y": [0,1], "z": [0,1]},
            "grid_ivs": [],
            "ticker": ticker_symbol
        }