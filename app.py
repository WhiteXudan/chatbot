from flask import Flask, render_template, request, jsonify
import json
import openai


# Charger les données JSON
def load_data():
    with open("data.json", "r") as file:
        return json.load(file)
    
# Rechercher des correspondance dans le fichier JSON
def search_in_json(question, data):
    keywords = question.split() # On Casse la question en petits mots-clés
    relatives_result = [] # Tableaux pour stocker les données relatives à la question

    # Recherche des données qui sont relatives à ces mots-clés dans le fichier JSON
    for key, value in data.items():
        if any(keyword.lower() in value.lower() for keyword in keywords):
            relatives_result.append(value) # ajouter la donnée au tableau de données relatives si trouvé

    return relatives_result # Renvoyer les données collecter dans le JSON

# Demande une réponse à GPT
def get_gpt_response(context):
    openai.api_key = "your-openai-api-key-here"
    
    prompt = f"""
    Voici la question : {context['question']}
    Voici les informations pertinentes que tu dois utiliser pour répondre à la question : {context['relatives_result']}
    Réponds à la question en utilisant ces informations, et améliore la réponse avec des ressources disponibles sur internet uniquement si nécessaire (par exemple, si les informations sont insuffisantes). 
    Tu es un assistant pour les nouveaux étudiants de LPSIC-LPDM (Licence Professionnelle Sécurité Informatique & Cybersécurité et Licence Professionnelle Développement Web & Mobile de l'Université de Kara). 
    Evite les phrases comme "Voici la réponse à ta question" ou "Je vais essayer de répondre à ta question". Commence directement la réponse de manière chaleureuse et accueillante, en mentionnant LPSIC-LPDM quand cela est possible. 
    Par exemple, si la question porte sur le déroulement des cours à LPSIC-LPDM, réponds ainsi : "À LPSIC-LPDM, les cours se déroulent ..."
    """
    
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=200
    )
    
    return response.choices[0].text.strip()


app = Flask(__name__) # Création de l'application flask

@app.route('/') # Definit  le chemin de la page principal (index.html)
def home():
    return render_template('index.html'); # Renvoie la page index.html

@app.route('/ask', methods=['POST'])
def ask():
    question = request.json.get('question')  # Récupère la question depuis la requête JSON
    data = load_data()  # Charge les données JSON

    # Recherche des informations pertinentes dans le JSON
    relatives_result = search_in_json(question, data)

    # Si des informations ont été trouvées dans le JSON
    if relatives_result:
        context = {
            'question': question,
            'relatives_result': relatives_result
        }
        answer = get_gpt_response(context)  # Utilise GPT pour générer une réponse
    else:
        # Si aucune information n'a été trouvée dans le JSON, GPT cherche sur Internet
        context = {
            'question': question,
            'relatives_result': "Aucune information disponible dans ma base... Recherche des informations sur Internet concernant l'Université de Kara et ses filières informatiques, notamment sur des sites comme 'www.univ-kara.tg' et 'logoti informatique kara'."
        }
        answer = get_gpt_response(context)  # GPT génère une réponse basée sur Internet

    return jsonify({'answer': answer})  # Renvoie la réponse sous forme JSON


if __name__ == "__main__":
    app.run(debug=True)
