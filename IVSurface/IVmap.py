import numpy as np
from scipy.interpolate import griddata
import logging
from .BSMCompute import compute_implied_vols

logger = logging.getLogger(__name__)

def generate_iv_surface(ticker_symbol):
    try:
        # Compute implied vols for CALLS
        ivs_calls, mny_calls, ttes_calls = compute_implied_vols(ticker_symbol, contract_type="calls")
        filtered_calls = [
            (iv, m, tte) 
            for iv, m, tte in zip(ivs_calls, mny_calls, ttes_calls)
            if -7 <= m <= 7
        ]
        ivs_calls_filtered, mny_calls_filtered, ttes_calls_filtered = zip(*filtered_calls) if filtered_calls else ([], [], [])

        # Compute implied vols for PUTS
        ivs_puts, mny_puts, ttes_puts = compute_implied_vols(ticker_symbol, contract_type="puts")
        filtered_puts = [
            (iv, m, tte)
            for iv, m, tte in zip(ivs_puts, mny_puts, ttes_puts)
            if -7 <= m <= 7
        ]
        ivs_puts_filtered, mny_puts_filtered, ttes_puts_filtered = zip(*filtered_puts) if filtered_puts else ([], [], [])

        # Combine data
        ivs = np.array(list(ivs_calls_filtered) + list(ivs_puts_filtered))
        mny = np.array(list(mny_calls_filtered) + list(mny_puts_filtered))
        ttes = np.array(list(ttes_calls_filtered) + list(ttes_puts_filtered))

        if len(ivs) == 0:
            return {"error": "No valid data after filtering", "bounds": {"x": [0,1], "y": [0,1], "z": [0,1]}, "grid_ivs": [], "ticker": ticker_symbol}

        # Create grid data
        grid_x, grid_y = np.meshgrid(
            np.linspace(np.min(mny), np.max(mny), 100),
            np.linspace(np.min(ttes), np.max(ttes), 100)
        )
        grid_z = griddata((mny, ttes), ivs, (grid_x, grid_y), method='cubic')
        grid_z = np.nan_to_num(grid_z, nan=np.nanmin(ivs))  # Handle NaNs

        return {
            "grid_mny": grid_x.tolist(),
            "grid_ttes": grid_y.tolist(),
            "grid_ivs": grid_z.tolist(),
            "bounds": {
                "x": [float(np.min(mny)), float(np.max(mny))],
                "y": [float(np.min(ttes)), float(np.max(ttes))],
                "z": [float(np.nanmin(ivs)), float(np.nanmax(ivs))]
            },
            "ticker": ticker_symbol
        }
    except Exception as e:
        logger.error(f"Error generating IV surface: {str(e)}", exc_info=True)
        return {"error": str(e), "bounds": {"x": [0,1], "y": [0,1], "z": [0,1]}, "grid_ivs": [], "ticker": ticker_symbol}