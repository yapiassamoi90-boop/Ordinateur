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
    alert("Menu Démarrer - Dev.Assamoi OS\nUtilisez les icônes du bureau pour lancer CMD, Word ou le Dossier d'Aide.");
}

// Interception globale des touches (Ctrl+P, Touches de Fonction F1-F12)
window.addEventListener('keydown', function(e) {
    // Gestion de Ctrl + P pour l'impression globale
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
    }

    // Gestion des touches de fonction (F1 à F12)
    if (e.key.startsWith('F')) {
        if (e.key === 'F2') {
            e.preventDefault();
            alert("Touche F2 interceptée : Mode d'édition rapide.");
        }
        if (e.key === 'F3') {
            e.preventDefault();
            openWindow('win-help'); // Ouvre le dossier d'aide avec F3
        }
        if (e.key === 'F5') {
            e.preventDefault();
            location.reload(); // Actualise l'application
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
            output.innerHTML += `Commandes disponibles :<br> - <b>cls</b> : Effacer l'écran<br> - <b>date</b> : Afficher la date<br> - <b>ver</b> : Version du système<br> - <b>excel</b> : Ouvrir l'aide Excel<br><br>`;
        } else if (val.toLowerCase() === 'cls') {
            output.innerHTML = '';
        } else if (val.toLowerCase() === 'date') {
            output.innerHTML += `${new Date().toLocaleString()}<br><br>`;
        } else if (val.toLowerCase() === 'ver') {
            output.innerHTML += `Dev.Assamoi WebOS v1.0 (Build 2026)<br><br>`;
        } else if (val.toLowerCase() === 'excel') {
            openWindow('win-help');
            output.innerHTML += `Ouverture du dossier d'aide Excel...<br><br>`;
        } else if (val !== '') {
            output.innerHTML += `'${val}' n'est pas reconnu en tant qu'commande interne.<br><br>`;
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
