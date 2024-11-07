import docker
from flask import Flask, jsonify

app = Flask(__name__)

def shutdown_containers():
    client = docker.from_env()
    containers = client.containers.list()
    
    # Stop all containers except the shutdown service itself
    for container in containers:
        if "shutdown-service" not in container.name:  # Exclude shutdown-service container
            container.stop()
    
    shutdown_service = client.containers.get("shutdown-service")
    shutdown_service.stop()

@app.route('/', methods=['POST'])
def shutdown():
    try:
        shutdown_containers()  # Call the shutdown process
        return jsonify({"message": "Shutdown initiated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=6969)  
