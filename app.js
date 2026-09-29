// Enregistrement du Service Worker pour le mode PWA / Offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker enregistré avec succès."))
    .catch((err) => console.log("Erreur Service Worker :", err));
}

// Horloge en direct dans la barre des tâches
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
}, 1000);

// Gestion de l'ouverture et de la fermeture des fenêtres
function openWindow(id) {
    document.getElementById(id).classList.add('active');
}

function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}

function toggleStartMenu() {
    alert("Menu Démarrer - Dev.Assamoi OS\nPoste de travail mobile actif.");
}

// --- GESTION DES DOSSIERS DU TÉLÉPHONE / BUREAU ---
let userFolders = ['Documents', 'Chantier Carena', 'Scripts JS', 'Projets Web'];

function renderFolders() {
    const container = document.getElementById('folders-container');
    if (!container) return;
    container.innerHTML = '';
    
    userFolders.forEach((folder) => {
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
    alert(`Ouverture du dossier : ${folderName}\n(Espace de stockage local prêt).`);
}

// Charger les dossiers au démarrage
window.addEventListener('DOMContentLoaded', () => {
    renderFolders();
});

// --- CLAVIER VIRTUEL DE TYPE PC ---
function toggleVirtualKeyboard() {
    const kb = document.getElementById('virtual-keyboard');
    if (kb.style.display === 'flex') {
        kb.style.display = 'none';
    } else {
        kb.style.display = 'flex';
    }
}

function sendKey(keyName) {
    const activeEl = document.activeElement;
    if (!activeEl) return;

    if (keyName === 'TAB') {
        activeEl.value += '\t';
    } else if (keyName === 'BACKSPACE') {
        activeEl.value = activeEl.value.slice(0, -1);
    } else {
        activeEl.value += keyName;
    }
}

// Interception globale des touches (Ctrl+P, Touches de Fonction F1-F12)
window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
    }

    if (e.key.startsWith('F')) {
        if (e.key === 'F2') {
            e.preventDefault();
            alert("Touche F2 interceptée : Mode d'édition rapide.");
        }
        if (e.key === 'F3') {
            e.preventDefault();
            openWindow('win-help');
        }
        if (e.key === 'F5') {
            e.preventDefault();
            location.reload();
        }
    }
});

// Logique de l'invite de commandes (CMD)
function handleCmd(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const val = input.value.trim();
        
        output.innerHTML += `C:\\Users\\Admin> ${val}<br>`;

        if (val.toLowerCase() === 'help') {
            output.innerHTML += `Commandes disponibles :<br> - <b>cls</b> : Effacer l'écran<br> - <b>date</b> : Afficher la date<br> - <b>ver</b> : Version du système<br> - <b>mkdir [nom]</b> : Créer un dossier<br><br>`;
        } else if (val.toLowerCase() === 'cls') {
            output.innerHTML = '';
        } else if (val.toLowerCase() === 'date') {
            output.innerHTML += `${new Date().toLocaleString()}<br><br>`;
        } else if (val.toLowerCase() === 'ver') {
            output.innerHTML += `Dev.Assamoi WebOS v1.0 (Build 2026)<br><br>`;
        } else if (val.startsWith('mkdir ')) {
            const newF = val.replace('mkdir ', '').trim();
            userFolders.push(newF);
            renderFolders();
            output.innerHTML += `Dossier '${newF}' créé avec succès sur le bureau.<br><br>`;
        } else if (val !== '') {
            output.innerHTML += `'${val}' n'est pas reconnu en tant que commande interne.<br><br>`;
        }

        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

// Recherche dynamique dans le dossier d'aide / codes
function filterCheatSheet() {
    const query = document.getElementById('searchCheat').value.toLowerCase();
    const sections = document.querySelectorAll('.cheat-sheet-section');

    sections.forEach(sec => {
        const text = sec.innerText.toLowerCase();
        if (text.includes(query)) {
            sec.style.display = 'block';
        } else {
            sec.style.display = 'none';
        }
    });
}
