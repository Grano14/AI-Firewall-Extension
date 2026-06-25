<div align="center">
  <img src="Extension/icon.png" alt="AI Firewall Logo" width="200" />
<p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Transformers.js-000000?style=flat" alt="Transformers.js" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  </p>
</div>

# AI Firewall Extension

**AI Firewall Extension** è un'estensione browser pensata per la privacy, che anonimizza automaticamente i dati sensibili (nomi, luoghi, organizzazioni) nei prompt inviati ai principali chatbot AI (ChatGPT, Gemini, Claude).

L'estensione agisce come un firewall locale, intercettando l'input utente e processandolo prima che lasci il browser.

## ⚙️ Architettura Tecnica
L'estensione adotta un approccio **Privacy-First** basato su una comunicazione a due livelli:
1. **Content Script:** Monitora l'input in tempo reale (`textarea` e `div[contenteditable]`) e inietta un iframe invisibile che funge da "Motore di Inferenza".
2. **Motore di Inferenza (Transformers.js):** L'iframe carica il modello `Xenova/bert-base-NER` direttamente nel browser dell'utente utilizzando `Transformers.js`.
3. **Comunicazione Sicura:** L'estensione e il Motore comunicano tramite l'API `window.postMessage`, garantendo che nessun dato sensibile venga mai inviato a server esterni per l'analisi.
4. **Privacy First:** I dati vengno elaborati totalmento in locale grazie all'uso di Trasformers.js che caricano il modello NER nel browser grazie alla pagina web index.html dispobibile tramite Github Pages sulla repo https://github.com/Grano14/AI-Firewall-Js-client.git.

## 🚀 Funzionalità
- **Riconoscimento Entità (NER):** Identificazione automatica di persone, luoghi e organizzazioni.
- **Anonimizzazione Chirurgica:** Sostituzione dei dati sensibili con segnaposto (es. `[PER]`, `[LOC]`) mantenendo intatta la struttura del prompt.
- **Debounce Mechanism:** Analisi ottimizzata per non impattare sulle performance di scrittura dell'utente.
- **Feedback Visivo:** L'icona dell'estensione cambia colore (`Rosso` -> `Arancio` -> `Verde`) in base allo stato di anonimizzazione.

## 🛠 Stack Tecnologico
- **Frontend:** JavaScript (ES6+), WebExtension API.
- **Machine Learning:** [Transformers.js](https://huggingface.co/docs/transformers.js/) con modello `bert-base-NER`.
- **Comunicazione:** Cross-Origin `postMessage` tra estensione e GitHub Pages.

## 📦 Installazione
1. Apri Chrome/Edge/Firefox.
2. Vai su `chrome://extensions/` nel tuo browser.
3. Cerca 'nome'.
4. Clicca su installa estensione.

## 📝 Utilizzo
Una volta installata, l'estensione rileva automaticamente i chatbot compatibili (ChatGPT, Gemini, Claude):
1. Inizia a digitare nel campo di input del chatbot.
2. L'estensione inizierà l'analisi in background (l'icona indicherà lo stato `...`).
3. Il testo nel box verrà automaticamente sostituito con le versioni anonimizzate non appena il modello NER completa l'inferenza.

## 🛡 Considerazioni sulla Privacy
- **Zero Server-Side:** Non esiste un server che riceve i tuoi prompt. Tutto accade sul tuo hardware.
- **Local Cache:** Il modello viene memorizzato nella cache del browser dopo il primo caricamento per velocizzare le sessioni successive.

## 📜 Licenza
Progetto rilasciato sotto licenza [MIT](https://opensource.org/licenses/MIT).
