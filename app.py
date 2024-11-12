from flask import Flask, render_template

app = Flask(__name__) # Création de l'application flask

@app.route('/') # Definit  le chemin de la page principal (index.html)
def home():
    return render_template('index.html'); # Renvoie la page index.html

if __name__ == "__main__":
    app.run(debug=True)
