from flask import Flask, jsonify
import os
import socket
import subprocess

app = Flask(__name__)

def get_container_info():
    ipAddress = socket.gethostbyname(socket.gethostname())
    processes = subprocess.getoutput("ps -ax")
    diskSpace = subprocess.getoutput("df -h /")
    upTime = subprocess.getoutput("uptime -p")
    return {
        "ipAddress": ipAddress,
        "processes": processes,
        "diskSpace": diskSpace,
        "upTime": upTime
    }

@app.route('/')
def index():
    return jsonify(get_container_info())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
