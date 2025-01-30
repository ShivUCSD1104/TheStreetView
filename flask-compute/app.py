from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from pathlib import Path
import traceback

sys.path.append(str(Path(__file__).parent.parent))

app = Flask(__name__)
CORS(app)  

@app.route('/compute', methods=['POST'])
def compute():
    try:
        print("\n=== Received Request ===")
        print("Headers:", request.headers)
        print("JSON Data:", request.json)
        
        data = request.json
        parameters = data.get('parameters', {})
        ticker = parameters.get('ticker', 'AAPL')
        print("Selected Ticker:", ticker)

        from IVSurface.IVmap import generate_iv_surface
        result = generate_iv_surface(ticker)
        print("Generated IV Surface Successfully")
        return jsonify(result)
        
    except Exception as e:
        print("\n=== ERROR ===")
        print(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, host='0.0.0.0')