const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const chatbotCloser = document.querySelector("#close-chatbot");

let firstQuestion = 1;
const conversationHistory = []; // Stocker l'historique ainsi garder le contexte...
if (conversationHistory.length > 1) {
  firstQuestion = 0;
}

// Configuration de l'API Gemini de Google
const API_KEY = "AIzaSyC6CiDUvJcqnGC7wPv1_yiWgKX0bcdr8PI";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
};

const initialHeight = messageInput.scrollHeight;

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";

  // Create and display user message
  const messageContent = `<div class="message-text"></div>`;

  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").textContent =
    userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    // Bot thinking
    const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                    viewBox="0 0 1024 1024">
                    <path
                        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
                </svg>
                <div id="response" class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Charger les données Text (remplace "data.txt" par le chemin réel de ton fichier Text)
const loadData = async () => {
  const response = await fetch("../data.txt");
  const data = await response.text();
  return data;
};

// Fonction de simulation de frappe...
function typeWriter(text, elementId, delay) {
  let index = 0;
  const element = document.getElementById(elementId);

  function addCharacter() {
    if (index < text.length) {
      element.innerHTML += text[index];
      index++;
      setTimeout(addCharacter, delay); // Ajoute le caractère suivant après un léger délai
    } else {
      element.removeAttribute("Id"); // Supprimer l'atribut Id quand le texte est fini de saisir
    }
  }

  addCharacter(); // Lance l'animation d'écriture
}

// Demande de Réponse à L'API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  const data = await loadData();

  // Construit le contexte avec l'historique des échanges
  const previousMessages = conversationHistory
    .map((entry) => `Utilisateur : ${entry.user}\nBot : ${entry.bot}`)
    .join("\n");

  const prompt = `
    Tu es un assistant dédié aux nouveaux étudiants de LPSIC-LPDM à l'Université de Kara. Ta mission est de fournir des informations, des conseils et des réponses aux questions concernant l'organisation, les services, les cours et l'administration de LPSIC-LPDM, en t'appuyant principalement sur tes connaissances générales et professionnelles pour répondre de manière complète. Utilise les informations du fichier si elles sont pertinentes, mais si elles ne couvrent pas la question, réponds avec des détails supplémentaires basés sur tes connaissances.
    
    Contexte de la conversation actuelle :
    ${previousMessages}

    Voici la question actuelle de l'utilisateur : ${userData.message}

    Utilise les informations suivantes si elles sont pertinentes : ${data}. Dans le cas où les informations fournies dans ${data} ne couvrent pas la question, utilise tes propres connaissances et capacités analytiques pour offrir une réponse utile et complète; en adoptant ton rôle d'assistant pour guider les nouveaux étudiants de LPSIC-LPDM sans mentionner Google ou Gemini.

    index=${firstQuestion}
    si index=0, alors réponds directement à la question sans t'introduire sinon tu peux t'introduire de la manière la plus accueillante possible, utilise les émojis pour expliciter les émotions...
    index=${firstQuestion}
  `;

  // Options de Requêtes de l'API Gemini
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Filtrer et afficher la réponse de Gemini
    const APIresponse = data.candidates[0].content.parts[0].text
      .replace(/```/g, "") // Enlève les backticks ```
      .replace(/\*\*\*/g, "") // Enlève les triples astérisques ***
      .replace(/\*\*/g, "") // Enlève les doubles astérisques **
      .trim();
    messageElement.innerHTML = "";
    typeWriter(APIresponse, "response", 20);

    // Ajoute l'échange au contexte
    conversationHistory.push({ user: userData.message, bot: APIresponse });
  } catch (error) {
    messageElement.innerHTML = ""; // Efface le message existant avant de mettre à jour
    typeWriter(error.message, "response", 20);
    messageElement.style.color = "#ff0000";
    if (error.message.includes("The model is overloaded")) {
      console.error(
        "Le modèle est surchargé. Nouvelle tentative dans 10 secondes..."
      );

      setTimeout(() => generateBotResponse(incomingMessageDiv), 10000); // Réessayer après 3 secondes
    } else {
      console.error("Une erreur inattendue est survenue:", error);
    }
  } finally {
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

//Adjust input field automatically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRaduis =
    messageInput.scrollHeight > initialHeight ? "15px" : "32px";
});

// Emoji controles
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPostion: "none",
  onClickOutside: (e) => {
    if (e.target.id == "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
});
document.querySelector(".chat-form").appendChild(picker);

messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
    e.target.value = ""; // éfface le champ après l'envoi
  }
});

sendMessageButton.addEventListener("click", (e) => {
  handleOutgoingMessage(e);
  e.target.value = "";
});

chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);
chatbotCloser.addEventListener("click", () => {
  console.log("chatbotCloser cliqué");
  document.body.classList.remove("show-chatbot");
});
