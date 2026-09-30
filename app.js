if ('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }

let zIndexCounter = 10;
let currentPath = "Ce PC";
let userFolders, importedFiles, installedApps;

try{
  userFolders = JSON.parse(localStorage.getItem('asamoi_folders')||'null') || ['Documents','Chantier Carena','Projets Web'];
  importedFiles = JSON.parse(localStorage.getItem('asamoi_files')||'null') || [];
  installedApps = JSON.parse(localStorage.getItem('asamoi_apps')||'null') || [];
}catch(e){
  userFolders = ['Documents','Chantier Carena','Projets Web'];
  importedFiles = [];
  installedApps = [];
}

const STORE_APPS = [
  {id:'calc',name:'Calculatrice',icon:'🔢',desc:'Calculatrice'},
  {id:'paint',name:'Paint',icon:'🎨',desc:'Dessin'},
  {id:'notes',name:'Bloc-notes',icon:'📓',desc:'Notes'},
  {id:'camera',name:'Caméra',icon:'📷',desc:'Photo'}
];

window.addEventListener('load',()=>{
  setTimeout(()=>{
    document.getElementById('boot-screen')?.classList.add('hidden');
    renderFolders(); renderStore();
  },2800);
});

setInterval(()=>{ const el=document.getElementById('clock'); if(el) el.innerText=new Date().toLocaleTimeString('fr-FR'); },1000);

function openWindow(id){ const w=document.getElementById(id); if(!w) return; w.classList.add('active'); w.style.zIndex=++zIndexCounter; closeStartMenu(); if(id==='win-explorer') renderExplorer(currentPath); if(id==='win-store') renderStore(); makeDraggable(w); }
function closeWindow(id){ document.getElementById(id)?.classList.remove('active'); }
function minimizeWindow(id){ closeWindow(id); }
function makeDraggable(win){ const h=win.querySelector('.window-header'); if(!h||h.dataset.drag==="1") return; h.dataset.drag="1"; let sx,sy,ox,oy,drag=false; const s=(x,y)=>{drag=true;sx=x;sy=y;ox=win.offsetLeft;oy=win.offsetTop;win.style.zIndex=++zIndexCounter;}; const m=(x,y)=>{if(!drag)return;win.style.left=(ox+x-sx)+'px';win.style.top=(oy+y-sy)+'px';}; const e=()=>drag=false; h.addEventListener('touchstart',ev=>s(ev.touches[0].clientX,ev.touches[0].clientY),{passive:false}); h.addEventListener('touchmove',ev=>{ev.preventDefault();m(ev.touches[0].clientX,ev.touches[0].clientY);},{passive:false}); h.addEventListener('touchend',e); h.addEventListener('mousedown',ev=>{s(ev.clientX,ev.clientY); const mm=e=>m(e.clientX,e.clientY); const mu=()=>{e();document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);}; document.addEventListener('mousemove',mm); document.addEventListener('mouseup',mu);}); }
function toggleStartMenu(){ document.getElementById('start-menu').classList.toggle('start-menu-hidden'); }
function closeStartMenu(){ document.getElementById('start-menu')?.classList.add('start-menu-hidden'); }
function launchFromStart(id){ openWindow(id); }

function renderStore(){ const list=document.getElementById('store-list'); if(!list) return; list.innerHTML=''; STORE_APPS.forEach(app=>{ const installed=installedApps.find(a=>a.id===app.id); list.innerHTML+=`<div style="display:flex;justify-content:space-between;align-items:center;background:#fff;padding:12px;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"><div style="display:flex;gap:10px;align-items:center"><span style="font-size:28px">${app.icon}</span><div><b>${app.name}</b><br><small style="color:#666">${app.desc}</small></div></div><button onclick="installApp('${app.id}')" style="background:${installed?'#ccc':'#0078d7'};color:#fff;border:none;padding:7px 14px;border-radius:6px">${installed?'Installé':'Installer'}</button></div>`; }); }
function installApp(id){ if(installedApps.find(a=>a.id===id)) return; const app=STORE_APPS.find(a=>a.id===id); installedApps.push(app); localStorage.setItem('asamoi_apps',JSON.stringify(installedApps)); renderStore(); renderFolders(); }

function renderExplorer(path="Ce PC"){ currentPath=path; const list=document.getElementById('explorer-files-list'); const bc=document.getElementById('explorer-path'); if(!list) return; if(bc) bc.innerText=path; list.innerHTML=""; if(path==="Ce PC"){ ["Disque Local (C:)","Disque Data (D:)","Clé USB (E:)"].forEach(name=>{ list.innerHTML+=`<div onclick="renderExplorer('${name}')" style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid #eee;cursor:pointer;"><span style="font-size:30px">💾</span><div><b>${name}</b><br><small>120 Go libre</small></div></div>`; }); return; } list.innerHTML=`<div onclick="renderExplorer('Ce PC')" style="cursor:pointer;color:#0078d7;padding:10px">⬅️ Retour</div>`; userFolders.forEach(f=>{list.innerHTML+=`<div style="padding:8px 10px;">📁 ${f}</div>`;}); importedFiles.forEach((file,i)=>{list.innerHTML+=`<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #f5f5f5;"><span>📄 ${file.name}</span><button onclick="openImportedFile(${i})" style="background:#0078d7;color:#fff;border:none;padding:5px 10px;border-radius:5px;">Ouvrir</button></div>`;}); }

function renderFolders(){ const c=document.getElementById('folders-container'); if(!c) return; let html=`<div class="icon" onclick="renderExplorer('Ce PC'); openWindow('win-explorer')"><span>🖥️</span><p>Ce PC</p></div><div class="icon" onclick="openWindow('win-browser')"><span>🌐</span><p>Chrome</p></div><div class="icon" onclick="openWindow('win-store')"><span>🛒</span><p>Store</p></div><div class="icon" onclick="openWindow('win-cmd')"><span>⌨️</span><p>CMD</p></div>`; html+=userFolders.map(f=>`<div class="icon"><span>📁</span><p>${f}</p></div>`).join(''); html+=installedApps.map(a=>`<div class="icon"><span>${a.icon}</span><p>${a.name}</p></div>`).join(''); html+=importedFiles.map((f,i)=>`<div class="icon" onclick="openImportedFile(${i})"><span>📄</span><p style="font-size:11px">${f.name.substring(0,10)}</p></div>`).join(''); c.innerHTML=html; }

function importFileToOS(e){ const file=e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=ev=>{ importedFiles.push({name:file.name,size:(file.size/1024).toFixed(1)+' Ko',content:ev.target.result}); localStorage.setItem('asamoi_files',JSON.stringify(importedFiles)); renderFolders(); renderExplorer(currentPath); }; r.readAsDataURL(file); }
function openImportedFile(i){ const f=importedFiles[i]; const w=window.open('','_blank'); w.document.write(`<img src="${f.content}" style="max-width:100%"><p>${f.name}</p>`); }
function browserGo(){ let url=document.getElementById('browser-url').value.trim(); if(url){ if(!url.startsWith('http')) url='https://'+url; document.getElementById('browser-iframe').src=url; document.getElementById('browser-preview').style.display='block'; setTimeout(()=>window.open(url,'_blank'),700); } }
function systemAction(a){ if(a==='shutdown'){ document.getElementById('shutdown-screen').style.display='flex'; closeStartMenu(); } else if(a==='restart'){ location.reload(); } }
function turnOnPC(){ document.getElementById('shutdown-screen').style.display='none'; const b=document.getElementById('boot-screen'); b.classList.remove('hidden'); setTimeout(()=>b.classList.add('hidden'),2500); }
function handleCmd(e){ if(e.key!=='Enter') return; const inp=document.getElementById('cmd-input'); const out=document.getElementById('cmd-output'); const raw=inp.value; const parts=raw.trim().split(' '); const cmd=parts[0].toLowerCase(); const arg=parts.slice(1).join(' '); out.innerHTML+=`C:\\Assamoi> ${raw}<br>`; if(cmd==='help') out.innerHTML+=`dir - liste<br>mkdir [nom] - creer<br>del [nom] - suppr<br>echo [txt]<br>cls - effacer<br>ver - version<br>store - store<br>help - aide<br><br>`; else if(cmd==='cls') out.innerHTML=''; else if(cmd==='dir'||cmd==='ls'){ let t=`Repertoire de C:\\Assamoi<br><br>`; userFolders.forEach(f=>t+=`[DIR] ${f}<br>`); importedFiles.forEach(f=>t+=`${f.size} ${f.name}<br>`); installedApps.forEach(a=>t+=`[APP] ${a.name}<br>`); t+=`<br>${userFolders.length+importedFiles.length} fichier(s)<br><br>`; out.innerHTML+=t; } else if(cmd==='mkdir'&&arg){ userFolders.push(arg); localStorage.setItem('asamoi_folders',JSON.stringify(userFolders)); out.innerHTML+=`Dossier ${arg} cree<br><br>`; renderFolders(); } else if(cmd==='del'&&arg){ userFolders=userFolders.filter(f=>f.toLowerCase()!==arg.toLowerCase()); localStorage.setItem('asamoi_folders',JSON.stringify(userFolders)); out.innerHTML+=`${arg} supprime<br><br>`; renderFolders(); } else if(cmd==='echo'){ out.innerHTML+=`${arg}<br><br>`; } else if(cmd==='ver') out.innerHTML+=`Assamoi OS v11.0<br><br>`; else if(cmd==='store') openWindow('win-store'); else if(raw.trim()!=='') out.innerHTML+=`'${cmd}' non reconnu. Tape help<br><br>`; inp.value=''; out.scrollTop=out.scrollHeight; }
window.addEventListener('click', e=>{ if(!e.target.closest('#start-menu') &&!e.target.closest('#start-btn')) closeStartMenu(); });

// ================== RACCOURCIS CLAVIER ==================
document.addEventListener('keydown', (e)=>{
  const ctrl = e.ctrlKey;
  const alt = e.altKey;
  const key = e.key.toLowerCase();

  if(ctrl && key === 'p'){ e.preventDefault(); renderExplorer('Ce PC'); openWindow('win-explorer'); }
  if(ctrl && key === 'b'){ e.preventDefault(); openWindow('win-browser'); }
  if(ctrl && key === 'c'){ e.preventDefault(); openWindow('win-cmd'); }
  if(ctrl && key === 's'){ e.preventDefault(); openWindow('win-store'); }
  if(ctrl && key === 'd'){ e.preventDefault(); openWindow('win-browser'); setTimeout(()=>document.getElementById('download-url')?.focus(),300); }
  if(ctrl && key === 'n'){ e.preventDefault(); const nom=prompt('Nom du nouveau dossier :'); if(nom){ userFolders.push(nom); localStorage.setItem('asamoi_folders',JSON.stringify(userFolders)); renderFolders(); } }
  if(ctrl && key === 'l'){ e.preventDefault(); const out=document.getElementById('cmd-output'); if(out) out.innerHTML=''; }
  if(alt && e.key === 'F4'){ e.preventDefault(); document.querySelectorAll('.window.active').forEach(w=>w.classList.remove('active')); }
  if(ctrl && e.shiftKey && key === 'e'){ e.preventDefault(); systemAction('shutdown'); }
});

// ================== TELECHARGEMENT DIRECT ==================
function downloadToAssamoi(){
  const url = document.getElementById('download-url').value.trim();
  const status = document.getElementById('download-status');
  if(!url){ status.innerHTML='<span style="color:red">Colle un lien!</span>'; return; }
  status.innerHTML='⏳ Téléchargement en cours...';
  fetch(url)
 .then(r=>{ if(!r.ok) throw new Error('Bloqué'); return r.blob(); })
 .then(blob=>{
      const reader = new FileReader();
      reader.onload = e=>{
        const name = url.split('/').pop().split('?')[0] || 'fichier_'+Date.now();
        importedFiles.push({name:name, size:(blob.size/1024).toFixed(1)+' Ko', content:e.target.result});
        localStorage.setItem('asamoi_files', JSON.stringify(importedFiles));
        renderFolders(); renderExplorer(currentPath);
        status.innerHTML=`<span style="color:green">✅ ${name} téléchargé dans Assamoi OS!</span>`;
        document.getElementById('download-url').value='';
      };
      reader.readAsDataURL(blob);
    })
 .catch(err=>{
      status.innerHTML=`<span style="color:orange">⚠️ Lien bloqué (CORS). J'ouvre dans un nouvel onglet.</span>`;
      window.open(url,'_blank');
    });
}
