// Enregistrement Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// --- SYSTEME DE FICHIERS VIRTUEL ---
const FILE_SYSTEM = {
  "Ce PC": {
    "Disque Local (C:)": { type: "drive", icon: "💾", files: [] },
    "Disque Data (D:)": { type: "drive", icon: "🗄️", files: [] },
    "Clé USB (E:)": { type: "drive", icon: "🔑", files: [] },
  }
};

let zIndexCounter = 10;
let currentPath = "Ce PC";

// CORRECTION 1 : évite le crash si localStorage vide
let userFolders, importedFiles;
try {
  userFolders = JSON.parse(localStorage.getItem('asamoi_folders') || 'null') || ['Documents', 'Chantier Carena', 'Projets Web'];
  importedFiles = JSON.parse(localStorage.getItem('asamoi_files') || 'null') || [];
} catch(e) {
  userFolders = ['Documents', 'Chantier Carena', 'Projets Web'];
  importedFiles = [];
}

// Horloge en direct
setInterval(() => {
    const el = document.getElementById('clock');
    if(el) el.innerText = new Date().toLocaleTimeString('fr-FR');
}, 1000);

// --- GESTION DES FENÊTRES ---
function openWindow(id) {
    const win = document.getElementById(id);
    if(!win) return;
    win.classList.add('active');
    win.style.zIndex = ++zIndexCounter;
    closeStartMenu();
    if(id === 'win-explorer') renderExplorer(currentPath);
    makeDraggable(win);
}
function closeWindow(id) { document.getElementById(id)?.classList.remove('active'); }
function minimizeWindow(id) { closeWindow(id); }

function makeDraggable(win) {
    const header = win.querySelector('.window-header');
    if(!header || header.dataset.drag === "1") return;
    header.dataset.drag = "1";
    let sx, sy, ox, oy;
    const start = (x, y) => { sx = x; sy = y; ox = win.offsetLeft; oy = win.offsetTop; win.style.zIndex = ++zIndexCounter; };
    const move = (x, y) => { win.style.left = (ox + x - sx) + 'px'; win.style.top = (oy + y - sy) + 'px'; };
    header.addEventListener('touchstart', e => start(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    header.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    header.addEventListener('mousedown', e => {
        start(e.clientX, e.clientY);
        const onMove = ev => move(ev.clientX, ev.clientY);
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

// --- MENU DÉMARRER ---
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('start-menu-hidden');
    if(!menu.classList.contains('start-menu-hidden')) document.getElementById('startSearchInput')?.focus();
}
function closeStartMenu() { document.getElementById('start-menu')?.classList.add('start-menu-hidden'); }
function launchFromStart(id) { openWindow(id); }
function filterStartMenu(e) {
    const q = document.getElementById('startSearchInput').value.toLowerCase();
    if(e.key === 'Enter') {
        if(q.includes('cmd')) openWindow('win-cmd');
        else if(q.includes('word')) openWindow('win-word');
        else if(q.includes('navigateur') || q.includes('chrome') || q.includes('google') || q.includes('youtube')) openWindow('win-browser');
        else if(q.includes('aide') || q.includes('code')) openWindow('win-help');
        else openWindow('win-explorer');
    }
}

// --- EXPLORATEUR ---
function renderExplorer(path = "Ce PC") {
    currentPath = path;
    const list = document.getElementById('explorer-files-list');
    const breadcrumb = document.getElementById('explorer-path');
    if(!list) return;
    if(breadcrumb) breadcrumb.innerText = path;
    list.innerHTML = "";
    if(path === "Ce PC") {
        Object.entries(FILE_SYSTEM["Ce PC"]).forEach(([name, drive]) => {
            list.innerHTML += `
            <div class="drive-item" onclick="renderExplorer('${name}')" style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #eee;cursor:pointer;">
                <span style="font-size:28px">${drive.icon}</span>
                <div><b>${name}</b><br><small style="color:#666">120 Go libre sur 250 Go</small>
                <div style="background:#ddd;height:6px;width:140px;margin-top:4px;border-radius:3px"><div style="background:#0078d7;width:55%;height:100%;border-radius:3px"></div></div></div>
            </div>`;
        });
        return;
    }
    list.innerHTML = `<div onclick="renderExplorer('Ce PC')" style="cursor:pointer;color:#0078d7;margin-bottom:12px;font-weight:600">⬅️ Retour à Ce PC</div>`;
    userFolders.forEach(f => { list.innerHTML += `<div class="file-item" style="padding:6px 0;">📁 ${f}</div>`; });
    if(importedFiles.length === 0) {
        list.innerHTML += `<p style="color:#777;margin-top:10px;font-size:13px;">Aucun fichier dans ${path}. Clique sur + Importer.</p>`;
    }
    importedFiles.forEach((file, i) => {
        list.innerHTML += `
            <div class="file-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f5f5f5;">
                <span>📄 ${file.name} (${file.size})</span>
                <div>
                    <button onclick="openImportedFile(${i})" style="background:#0078d7;color:#fff;border:none;padding:4px 10px;border-radius:4px;margin-right:5px;">Ouvrir</button>
                    <button onclick="deleteImportedFile(${i})" style="background:#d83b01;color:#fff;border:none;padding:4px 8px;border-radius:4px;">X</button>
                </div>
            </div>`;
    });
}

// --- NAVIGATEUR ---
function navigateTo(url) {
    const iframe = document.getElementById('browser-iframe');
    const input = document.getElementById('browser-url');
    if(!url.startsWith('http')) url = 'https://' + url;
    iframe.src = url;
    if(input) input.value = url;
}
function browserGo() {
    const url = document.getElementById('browser-url').value.trim();
    if(!url) return;
    if(url.includes('youtube')) navigateTo('https://www.youtube.com');
    else if(url.includes('google') || url === 'google.com') navigateTo('https://www.google.com/webhp?igu=1');
    else navigateTo(url);
}

// --- BUREAU ---
function renderFolders() {
    const c = document.getElementById('folders-container');
    if(!c) return;
    c.innerHTML = `
        <div class="icon" onclick="renderExplorer('Ce PC'); openWindow('win-explorer')"><span>🖥️</span><p>Ce PC</p></div>
        <div class="icon" onclick="openWindow('win-browser')"><span>🌐</span><p>Chrome</p></div>
        <div class="icon" onclick="openWindow('win-word')"><span>📝</span><p>WordPad</p></div>
        <div class="icon" onclick="openWindow('win-cmd')"><span>⌨️</span><p>CMD</p></div>
        <div class="icon" onclick="openWindow('win-help')"><span>❓</span><p>Aide</p></div>
        ${userFolders.map(f => `<div class="icon"><span>📁</span><p>${f}</p></div>`).join('')}
        ${importedFiles.map((f, i) => `<div class="icon" onclick="openImportedFile(${i})"><span>📄</span><p style="font-size:11px;overflow:hidden;white-space:nowrap;width:75px">${f.name}</p></div>`).join('')}
    `;
}
function importFileToOS(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        importedFiles.push({name: file.name, size: (file.size/1024).toFixed(1) + ' Ko', content: ev.target.result});
        localStorage.setItem('asamoi_files', JSON.stringify(importedFiles));
        renderFolders();
        renderExplorer(currentPath);
        alert(`"${file.name}" importé dans ${currentPath}!`);
    };
    reader.readAsDataURL(file);
}
function openImportedFile(i) {
    const f = importedFiles[i];
    if(!f) return;
    const w = window.open('', '_blank');
    if(f.content.startsWith('data:image')) {
        w.document.write(`<title>${f.name}</title><img src="${f.content}" style="max-width:100%">`);
    } else {
        w.document.write(`<title>${f.name}</title><pre style="padding:20px;white-space:pre-wrap;word-break:break-all;">${f.content}</pre>`);
    }
}
function deleteImportedFile(i) {
    if(confirm("Supprimer ce fichier?")) {
        importedFiles.splice(i, 1);
        localStorage.setItem('asamoi_files', JSON.stringify(importedFiles));
        renderFolders();
        renderExplorer(currentPath);
    }
}

// --- SYSTEME ---
function systemAction(action) {
    if (action === 'shutdown') {
        document.getElementById('shutdown-screen').style.display = 'flex';
        closeStartMenu();
    } else if (action === 'restart') location.reload();
}
function turnOnPC() { document.getElementById('shutdown-screen').style.display = 'none'; }

// CORRECTION 2 : clavier virtuel qui marche partout
function toggleVirtualKeyboard() {
    const kb = document.getElementById('virtual-keyboard');
    if(!kb) return;
    const isFlex = kb.style.display === 'flex';
    kb.style.display = isFlex? 'none' : 'flex';
    kb.style.flexWrap = 'wrap';
}
function sendKey(keyName) {
    const el = document.activeElement;
    if(!el) return;
    // Pour les input classiques
    if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
        if(keyName === 'BACKSPACE') el.value = el.value.slice(0, -1);
        else if(keyName === 'Tab') el.value += '\t';
        else el.value += keyName;
    } else if(el.isContentEditable){
        // Pour WordPad
        if(keyName === 'BACKSPACE') document.execCommand('delete', false, null);
        else document.execCommand('insertText', false, keyName);
    }
}

// --- CMD ---
function handleCmd(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const raw = input.value;
        const val = raw.trim().toLowerCase();
        output.innerHTML += `C:\\Users\\Admin> ${raw}<br>`;
        if (val === 'help') output.innerHTML += `Commandes : cls, date, ver, shutdown, explorer, chrome, word<br><br>`;
        else if (val === 'cls') output.innerHTML = '';
        else if (val === 'date') output.innerHTML += `${new Date().toLocaleString()}<br><br>`;
        else if (val === 'ver') output.innerHTML += `AsaMoi OS [Version 11.0 - Dev.Assamoi]<br><br>`;
        else if (val === 'explorer') openWindow('win-explorer');
        else if (val === 'chrome') openWindow('win-browser');
        else if (val === 'word') openWindow('win-word');
        else if (val === 'shutdown') systemAction('shutdown');
        else if (val!== '') output.innerHTML += `'${val}' non reconnu.<br><br>`;
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

function filterCheatSheet() {
    const query = document.getElementById('searchCheat')?.value.toLowerCase() || '';
    document.querySelectorAll('.cheat-sheet-section').forEach(sec => {
        sec.style.display = sec.innerText.toLowerCase().includes(query)? 'block' : 'none';
    });
}

window.addEventListener('DOMContentLoaded', renderFolders);
window.addEventListener('click', (e)=>{
    if(!e.target.closest('#start-menu') &&!e.target.closest('#start-btn')){
        closeStartMenu();
    }
});
