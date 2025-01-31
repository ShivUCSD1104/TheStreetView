# # IVSurface/iv_surface_data.py (updated)
# import numpy as np
# from scipy.interpolate import griddata
# from .BSMCompute import compute_implied_vols

# def get_iv_surface_data(ticker_symbol="AAPL"):
#     try:
#         # Combine calls and puts data
#         combined_data = []
#         for contract_type in ["calls", "puts"]:
#             ivs, mny, ttes = compute_implied_vols(ticker_symbol, contract_type)
#             filtered = [
#                 (iv, m, tte)
#                 for iv, m, tte in zip(ivs, mny, ttes)
#                 if -7 <= m <= 7
#             ]
#             combined_data.extend(filtered)

#         if not combined_data:
#             return {"error": "No valid options data found"}

#         ivs, mny, ttes = zip(*combined_data)
#         ivs = np.array(ivs)
#         mny = np.array(mny)
#         ttes = np.array(ttes)

#         # Grid generation with safety checks
#         grid_mny, grid_ttes = np.meshgrid(
#             np.linspace(mny.min(), mny.max(), 100),
#             np.linspace(ttes.min(), ttes.max(), 100)
#         )
        
#         # Handle interpolation failures
#         try:
#             grid_ivs = griddata((mny, ttes), ivs, (grid_mny, grid_ttes), method='cubic')
#         except:
#             grid_ivs = np.full_like(grid_mny, np.nan)

#         # Convert NaN to None for JSON
#         grid_ivs_clean = [
#             [val if not np.isnan(val) else None for val in row] 
#             for row in grid_ivs.tolist()
#         ]

#         return {
#             "gridMNY": grid_mny.tolist(),
#             "gridTTES": grid_ttes.tolist(),
#             "gridIVS": grid_ivs_clean
#         }
#     except Exception as e:
#         return {"error": str(e)}