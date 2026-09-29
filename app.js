// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker enregistré."))
    .catch((err) => console.log("Erreur SW :", err));
}

// Horloge en direct
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
}, 1000);

// Gestion des fenêtres
function openWindow(id) {
    document.getElementById(id).classList.add('active');
}

function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}

function toggleStartMenu() {
    alert("Menu Démarrer - Dev.Assamoi OS\nPoste de travail mobile actif.");
}

// --- SIMULATION DE L'EXPLORATEUR DE FICHIERS / DOSSIERS ---
let userFolders = ['Documents', 'Chantier Carena', 'Scripts JS', 'Projets Web'];

function renderFolders() {
    const container = document.getElementById('folders-container');
    if (!container) return;
    container.innerHTML = '';
    
    userFolders.forEach((folder, index) => {
        container.innerHTML += `
            <div class="icon" onclick="openFolderContent('${folder}')">
                <span>📁</span>
                <p>${folder}</p>
            </div>
        `;
    });
}

function createNewFolder() {
    const folderName = prompt("Nom du nouveau dossier :");
    if (folderName && folderName.trim() !== '') {
        userFolders.push(folderName.trim());
        renderFolders();
    }
}

function openFolderContent(folderName) {
    alert(`Ouverture du dossier : ${folderName}\n(Ici s'afficheront vos fichiers locaux).`);
}

// Initialisation des dossiers au chargement
window.addEventListener('DOMContentLoaded', () => {
    renderFolders();
});

// --- CLAVIER VIRTUEL PC POUR MOBILE ---
function toggleVirtualKeyboard() {
    const kb = document.getElementById('virtual-keyboard');
    if (kb.style.display === 'flex') {
        kb.style.display = 'none';
    } else {
        kb.style.display = 'flex';
    }
}

// Simulation de touches spéciales pour le champ actif
function sendKey(keyName) {
    const activeEl = document.activeElement;
    if (!activeEl) return;

    if (keyName === 'TAB') {
        activeEl.value += '\t';
    } else if (keyName === 'ENTER') {
        if (activeEl.id === 'cmd-input') {
            handleCmd({ key: 'Enter' });
        } else {
            activeEl.value += '\n';
        }
    } else if (keyName === 'BACKSPACE') {
        activeEl.value = activeEl.value.slice(0, -1);
    } else {
        activeEl.value += keyName;
    }
}

// Logique CMD
function handleCmd(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const val = input.value.trim();
        
        output.innerHTML += `C:\\Users\\Admin> ${val}<br>`;

        if (val.toLowerCase() === 'help') {
            output.innerHTML += `Commandes : cls, date, ver, mkdir [dossier]<br><br>`;
        } else if (val.toLowerCase() === 'cls') {
            output.innerHTML = '';
        } else if (val.toLowerCase() === 'date') {
            output.innerHTML += `${new Date().toLocaleString()}<br><br>`;
        } else if (val.startsWith('mkdir ')) {
            const newF = val.replace('mkdir ', '').trim();
            userFolders.push(newF);
            renderFolders();
            output.innerHTML += `Dossier '${newF}' créé avec succès sur le bureau.<br><br>`;
        } else if (val !== '') {
            output.innerHTML += `'${val}' non reconnu.<br><br>`;
        }

        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}
