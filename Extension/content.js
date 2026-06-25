// 1. INIEZIONE IFRAME (Il motore di anonimizzazione)
const iframe = document.createElement('iframe');
iframe.src = "https://grano14.github.io/AI-Firewall-Js-client/";
iframe.style.display = "none";
document.body.appendChild(iframe);

let debounceTimer;

// Funzione di utilità per aggiornare l'icona (badge)
function aggiornaIcona(stato) {
    const stati = {
        'non_anonimizzato': { color: '#FF0000', text: '!' }, // Rosso
        'anonimizzando': { color: '#FFA500', text: '...' },  // Arancio
        'anonimizzato': { color: '#008000', text: 'OK' }     // Verde
    };
    chrome.runtime.sendMessage({ 
        action: "UPDATE_BADGE", 
        payload: stati[stato] 
    });
}

// Funzioni di elaborazione
function pulisciTagFinali(testo) {
    let pulito = testo.replace(/\[(?:B-|I-)?([A-Z]+)\]/g, '[$1]');
    pulito = pulito.replace(/(\[[A-Z]+\])\1+/g, '$1');
    pulito = pulito.replace(/(\[[A-Z]+\])\s+\1/g, '$1');
    return pulito;
}

function anonimizzaTesto(testo, entita) {
    if (!entita || entita.length === 0) return testo;
    let testoModificato = testo;
    let entitaPulite = entita.map(item => ({
        parola: (item.word || "").replace(/^##/, ''),
        tag: item.entity || item.entity_group || item.label || "DATI"
    })).filter(item => item.parola.length >= 3);
    entitaPulite.sort((a, b) => b.parola.length - a.parola.length);
    for (const item of entitaPulite) {
        const parolaProtetta = item.parola.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp('\\b' + parolaProtetta + '\\b', 'gi');
        testoModificato = testoModificato.replace(regex, `[${item.tag}]`);
    }
    return pulisciTagFinali(testoModificato);
}

// 2. SOSTITUZIONE CHIRURGICA CON CURSORE ALLA FINE
function sostituisciTestoPreservandoCursore(box, nuovoTesto) {
    if (box.tagName === 'TEXTAREA') {
        const pos = box.selectionStart;
        box.value = nuovoTesto;
        box.setSelectionRange(pos, pos);
    } else {
        box.innerText = nuovoTesto;
        const selection = window.getSelection();
        const range = document.createRange();
        const node = box.lastChild || box;
        if (node.nodeType === Node.TEXT_NODE) {
            range.setStart(node, node.length);
        } else {
            range.setStart(node, node.childNodes.length);
        }
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    box.dispatchEvent(new Event('input', { bubbles: true }));
}

// 3. MONITORAGGIO AUTOMATICO (Always-On)
document.addEventListener('input', (e) => {
    const box = e.target;
    if (box.matches('textarea') || box.getAttribute('contenteditable') === 'true') {
        aggiornaIcona('non_anonimizzato');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            aggiornaIcona('anonimizzando');
            const testo = box.value || box.innerText;
            iframe.contentWindow.postMessage({ text: testo, requestId: Date.now() }, "https://grano14.github.io");
        }, 1500);
    }
}, true);

// 4. RICEZIONE DAL MOTORE
window.addEventListener('message', (event) => {
    if (event.origin !== "https://grano14.github.io" || !event.data.result) return;
    const box = document.querySelector('textarea') || document.querySelector('div[contenteditable="true"]');
    if (box) {
        const testoAttuale = box.value || box.innerText;
        const risultatoPulito = anonimizzaTesto(testoAttuale, event.data.result);
        if (risultatoPulito !== testoAttuale) {
            sostituisciTestoPreservandoCursore(box, risultatoPulito);
            aggiornaIcona('anonimizzato');
        } else {
            aggiornaIcona('anonimizzato');
        }
    }
});