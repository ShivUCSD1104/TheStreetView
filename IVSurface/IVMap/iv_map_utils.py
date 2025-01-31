import numpy as np
from scipy.interpolate import griddata
from IVSurface.BSMCompute import compute_implied_vols

def get_iv_surface_data(ticker_symbol="AAPL"):
    """
    Computes and returns the data for an implied volatility surface
    (grid coordinates and implied-vol values) for a given ticker.
    
    The data is returned as a dictionary of lists so it can be 
    easily serialized to JSON and consumed by the frontend.
    """
    # Compute for calls
    ivs_calls, mny_calls, ttes_calls = compute_implied_vols(
        ticker_symbol, contract_type="calls"
    )
    filtered_calls = [
        (iv, m, tte) 
        for (iv, m, tte) in zip(ivs_calls, mny_calls, ttes_calls)
        if -7 <= m <= 7
    ]

    # Compute for puts
    ivs_puts, mny_puts, ttes_puts = compute_implied_vols(
        ticker_symbol, contract_type="puts"
    )
    filtered_puts = [
        (iv, m, tte) 
        for (iv, m, tte) in zip(ivs_puts, mny_puts, ttes_puts)
        if -7 <= m <= 7
    ]

    # Combine
    all_filtered = filtered_calls + filtered_puts
    if not all_filtered:
        return {
            "gridMNY": [],
            "gridTTES": [],
            "gridIVS": [],
        }

    ivs_filtered, mny_filtered, ttes_filtered = zip(*all_filtered)
    ivs = np.array(ivs_filtered)
    mny = np.array(mny_filtered)
    ttes = np.array(ttes_filtered)

    # Create mesh grid
    grid_mny, grid_ttes = np.meshgrid(
        np.linspace(min(mny), max(mny), 100),
        np.linspace(min(ttes), max(ttes), 100)
    )

    # Interpolate
    # If 'cubic' fails for your data, swap to 'linear'
    grid_ivs = griddata(
        (mny, ttes), 
        ivs,
        (grid_mny, grid_ttes),
        method='cubic'
    )

    # Convert to list for JSON serialization
    result = {
        "gridMNY": grid_mny.tolist(), 
        "gridTTES": grid_ttes.tolist(),
        "gridIVS": (grid_ivs.tolist() if grid_ivs is not None else []),
    }
    return result
