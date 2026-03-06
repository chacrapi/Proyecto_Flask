from flask import Flask, render_template
from Services.champion_service import get_all_champions

app = Flask(__name__)

@app.route("/")
def home():
    champions = get_all_champions()
    return render_template("champions.html", champions=champions)

@app.route("/champions")
def champions():
    champions = get_all_champions()
    return render_template("champions.html", champions=champions)

if __name__ == "__main__":
    app.run(debug=True)