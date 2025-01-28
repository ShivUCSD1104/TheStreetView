from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/compute', methods=['POST'])
def compute():
    data = request.json
    parameters = data.get('parameters', {})

    # Perform your computation here
    computed_data = perform_computation(parameters)

    return jsonify(computed_data)

def perform_computation(parameters):
    # Read params for which computation is to be done

    return 

if __name__ == '__main__':
    app.run(port=5000)