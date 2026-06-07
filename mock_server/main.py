from flask import Flask
from services.prometheus_mock import prometheus_bp
from services.kibana_mock import kibana_bp
from services.github_mock import github_bp

app = Flask(__name__)

# Register Blueprints (Keeping url_prefix empty so they match real API root relative paths)
app.register_blueprint(prometheus_bp)
app.register_blueprint(kibana_bp)
app.register_blueprint(github_bp)

@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "Mock environment is healthy and running!"}, 200

if __name__ == '__main__':
    print("Starting OpsPilot Mock API Engine on http://127.0.0.1:5001...")
    app.run(host='127.0.0.1', port=5001, debug=True)