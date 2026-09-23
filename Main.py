from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)


# Load resources from JSON
def load_resources():
    with open("resources.json", "r", encoding="utf-8") as file:
        return json.load(file)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/resources")
def resources():
    return jsonify(load_resources())


if __name__ == "__main__":
    app.run(debug=True)