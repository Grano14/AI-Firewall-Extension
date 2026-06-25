const iframe = document.getElementById('engine-iframe');
const btn = document.getElementById('btn-anon');
const output = document.getElementById('output');
let testoOriginale = "";

if (iframe && iframe.src) {
    const urlPulito = iframe.src.split('?')[0];
    iframe.src = urlPulito + "?t=" + Date.now();
}

function pulisciTagFinali(testo) {
    let pulito = testo.replace(/\[(?:B-|I-)?([A-Z]+)\]/g, '[$1]');
    pulito = pulito.replace(/(\[[A-Z]+\])\1+/g, '$1');
    pulito = pulito.replace(/(\[[A-Z]+\])\s+\1/g, '$1');
    return pulito;
}

function anonimizzaTesto(testo, entita) {
    console.log("[DEBUG] Token grezzi dal modello:", entita);
    let testoModificato = testo;

    if (!entita || entita.length === 0) return testo;

    // 1. Filtriamo e puliamo i token prima di applicarli
    let entitaPulite = entita.map(item => {
        let parola = item.word || "";
        // Rimuove il prefisso dei sub-token di BERT
        parola = parola.replace(/^##/, ''); 
        const tag = item.entity || item.entity_group || item.label || "DATI";
        return { parola, tag };
    });

    // 2. Eliminiamo i sub-token troppo corti (es: "g", "t", "in") che creano falsi positivi nei verbi
    entitaPulite = entitaPulite.filter(item => item.parola.length >= 3);

    // 3. Ordiniamo dalle parole più lunghe alle più corte
    entitaPulite.sort((a, b) => b.parola.length - a.parola.length);

    console.log("[DEBUG] Token filtrati pronti per l'applicazione:", entitaPulite);

    // 4. Sostituzione chirurgica usando i confini di parola (\b)
    for (const item of entitaPulite) {
        // Protegge i caratteri speciali della regex
        const parolaProtetta = item.parola.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        // \b assicura che venga sostituita la PAROLA INTERA, non pezzi dentro altre parole
        const regex = new RegExp('\\b' + parolaProtetta + '\\b', 'gi');
        
        testoModificato = testoModificato.replace(regex, `[${item.tag}]`);
    }

    return pulisciTagFinali(testoModificato);
}

iframe.addEventListener('load', () => { console.log("[DEBUG] Iframe pronto."); });

btn.addEventListener('click', async () => {
    output.value = "Cattura del prompt...";
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, { action: "CATTURA_TESTO_CHAT" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
            output.value = "Errore di cattura.";
            return;
        }
        testoOriginale = response.text;
        output.value = "Analisi...";
        iframe.contentWindow.postMessage({ text: testoOriginale, requestId: Date.now() }, "https://grano14.github.io");
    });
});

// Sostituisci solo questo blocco in fondo al tuo popup.js
window.addEventListener('message', async (event) => {
    if (event.origin !== "https://grano14.github.io") return;

    if (event.data.error) {
        output.value = "Errore: " + event.data.error;
    } else if (event.data.result) {
        // 1. Calcola il testo anonimizzato
        const risultatoPulito = anonimizzaTesto(testoOriginale, event.data.result);
        
        // 2. Mostralo nel popup per debug
        output.value = risultatoPulito;

        // 3. Spediscilo alla chat per sostituire il vecchio prompt
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { 
                action: "INSERISCI_TESTO_ANON", 
                text: risultatoPulito 
            });
        }
    }
});
