// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}

// Horloge en direct
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

// Gestion des fenêtres
function openWindow(id) {
    document.getElementById(id).classList.add('active');
    closeStartMenu();
    if(id === 'win-explorer') renderExplorerFiles();
}

function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}

// Menu Démarrer
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    if (menu.classList.contains('start-menu-hidden')) {
        menu.classList.remove('start-menu-hidden');
        document.getElementById('startSearchInput').focus();
    } else {
        closeStartMenu();
    }
}

function closeStartMenu() {
    document.getElementById('start-menu').classList.add('start-menu-hidden');
}

function launchFromStart(windowId) {
    openWindow(windowId);
}

// Recherche dans le Menu Démarrer
function filterStartMenu(e) {
    const query = document.getElementById('startSearchInput').value.toLowerCase();
    if (e.key === 'Enter') {
        if (query.includes('cmd')) openWindow('win-cmd');
        else if (query.includes('word')) openWindow('win-word');
        else if (query.includes('navigateur') || query.includes('google')) openWindow('win-browser');
        else if (query.includes('poste') || query.includes('dossier')) openWindow('win-explorer');
    }
}

// Options d'alimentation
function systemAction(action) {
    if (action === 'shutdown') {
        const screen = document.getElementById('shutdown-screen');
        if (screen) {
            screen.style.display = 'flex';
        }
        closeStartMenu();
    } else if (action === 'restart') {
        location.reload();
    }
}

// Allumer le PC depuis l'écran d'extinction
function turnOnPC() {
    const screen = document.getElementById('shutdown-screen');
    if (screen) {
        screen.style.display = 'none';
    }
}

// Gestion des dossiers et fichiers importés avec localStorage
let userFolders = JSON.parse(localStorage.getItem('asamoi_folders')) || ['Documents', 'Chantier Carena', 'Projets Web'];
let importedFiles = JSON.parse(localStorage.getItem('asamoi_files')) || [];

function renderFolders() {
    const container = document.getElementById('folders-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Affichage des dossiers
    userFolders.forEach(folder => {
        container.innerHTML += `
            <div class="icon" onclick="alert('Ouverture du dossier : ${folder}')">
                <span>📁</span>
                <p>${folder}</p>
            </div>
        `;
    });

    // Affichage des fichiers importés directement sur le bureau
    importedFiles.forEach((file, index) => {
        container.innerHTML += `
            <div class="icon" onclick="openImportedFile(${index})">
                <span>📄</span>
                <p style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 75px;">${file.name}</p>
            </div>
        `;
    });
}

function createNewFolder() {
    const name = prompt("Nom du nouveau dossier :");
    if (name && name.trim()) {
        userFolders.push(name.trim());
        localStorage.setItem('asamoi_folders', JSON.stringify(userFolders));
        renderFolders();
    }
}

// Importer un fichier depuis le téléphone dans l'OS
function importFileToOS(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' Ko',
            content: e.target.result
        };
        importedFiles.push(fileData);
        localStorage.setItem('asamoi_files', JSON.stringify(importedFiles));
        renderFolders();
        renderExplorerFiles();
        alert(`Fichier "${file.name}" importé avec succès dans votre PC virtuel !`);
    };
    reader.readAsDataURL(file);
}

function renderExplorerFiles() {
    const list = document.getElementById('explorer-files-list');
    if (!list) return;
    if (importedFiles.length === 0) {
        list.innerHTML = '<p style="color: #770; font-size: 13px;">Aucun fichier importé pour le moment.</p>';
        return;
    }
    list.innerHTML = '<ul style="list-style: none; padding: 0;">';
    importedFiles.forEach((file, index) => {
        list.innerHTML += `
            <li style="display: flex; justify-content: space-between; padding: 6px; border-bottom: 1px solid #eee; align-items: center;">
                <span>📄 ${file.name} (${file.size})</span>
                <div>
                    <button onclick="openImportedFile(${index})" style="background: #0078d7; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-right: 5px;">Ouvrir</button>
                    <button onclick="deleteImportedFile(${index})" style="background: #d83b01; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Supprimer</button>
                </div>
            </li>
        `;
    });
    list.innerHTML += '</ul>';
}

function openImportedFile(index) {
    const file = importedFiles[index];
    if (file.content.startsWith('data:image')) {
        let win = window.open();
        win.document.write(`<img src="${file.content}" style="max-width:100%;"/>`);
    } else {
        alert(`Ouverture du fichier texte/donnée : ${file.name}`);
    }
}

function deleteImportedFile(index) {
    if (confirm("Voulez-vous supprimer ce fichier de votre PC ?")) {
        importedFiles.splice(index, 1);
        localStorage.setItem('asamoi_files', JSON.stringify(importedFiles));
        renderFolders();
        renderExplorerFiles();
    }
}

function clearLocalStorage() {
    if (confirm("Attention : Vider le stockage va supprimer tous vos dossiers personnalisés et fichiers importés. Continuer ?")) {
        localStorage.clear();
        userFolders = ['Documents', 'Chantier Carena', 'Projets Web'];
        importedFiles = [];
        renderFolders();
        renderExplorerFiles();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderFolders();
});

// Clavier virtuel PC
function toggleVirtualKeyboard() {
    const kb = document.getElementById('virtual-keyboard');
    kb.style.display = kb.style.display === 'flex' ? 'none' : 'flex';
}

function sendKey(keyName) {
    const activeEl = document.activeElement;
    if (!activeEl) return;
    if (keyName === 'Tab') activeEl.value += '\t';
    else if (keyName === 'BACKSPACE') activeEl.value = activeEl.value.slice(0, -1);
    else activeEl.value += keyName;
}

// CMD Logique
function handleCmd(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const val = input.value.trim().toLowerCase();
        
        output.innerHTML += `C:\\Users\\Admin> ${input.value}<br>`;

        if (val === 'help') {
            output.innerHTML += `Commandes : cls, date, ver, shutdown<br><br>`;
        } else if (val === 'cls') {
            output.innerHTML = '';
        } else if (val === 'date') {
            output.innerHTML += `${new Date().toLocaleString()}<br><br>`;
        } else if (val === 'shutdown') {
            systemAction('shutdown');
        } else if (val !== '') {
            output.innerHTML += `'${val}' non reconnu.<br><br>`;
        }
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

function filterCheatSheet() {
    const query = document.getElementById('searchCheat').value.toLowerCase();
    document.querySelectorAll('.cheat-sheet-section').forEach(sec => {
        sec.style.display = sec.innerText.toLowerCase().includes(query) ? 'block' : 'none';
    });
}
