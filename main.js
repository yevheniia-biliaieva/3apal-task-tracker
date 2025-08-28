// ================== Utility ==================
function b64encode(str){ return btoa(unescape(encodeURIComponent(str))); }
function b64decode(str){ return decodeURIComponent(escape(atob(str))); }

// ================== Global state ==================
let TASKS = { lanes: [], tasks: [] };
let DONE = [];
let revMap = {};

// ================== UI Build ==================
function buildUI(){
  const wrapper = document.getElementById('roadmap');
  wrapper.innerHTML = "";

  TASKS.lanes.sort((a,b)=>a.order-b.order).forEach(lane=>{
    const col=document.createElement('div');
    col.className='lane';
    col.dataset.id=lane.id;

    const h2=document.createElement('h2');
    h2.textContent=lane.title;
    const btn=document.createElement('button');
    btn.className='add-task';
    btn.textContent='➕';
    btn.onclick=()=>openTaskModal({laneId:lane.id});
    h2.appendChild(btn);
    col.appendChild(h2);

    wrapper.appendChild(col);
  });

  renderTasks();
}

function renderTasks(){
  revMap={};
  TASKS.tasks.forEach(t=>{
    (t.deps||[]).forEach(d=>{
      if(!revMap[d]) revMap[d]=[];
      revMap[d].push(t.id);
    });
  });

  TASKS.lanes.forEach(lane=>{
    const col=document.querySelector(`.lane[data-id="${lane.id}"]`);
    if(!col) return;
    col.querySelectorAll('.task').forEach(el=>el.remove());
    TASKS.tasks.filter(t=>t.lane===lane.id).sort((a,b)=>a.order-b.order).forEach(task=>{
      const card=document.createElement('div');
      card.className='task';
      card.id=task.id;
      card.dataset.title=task.title;
      card.dataset.deps=(task.deps||[]).join(',');

      const title=document.createElement('div');
      title.className='title';
      title.textContent=task.title;
      card.appendChild(title);

      const raci=document.createElement('div');
      raci.className='raci';
      raci.textContent=`R: ${task.raci.R} | A: ${task.raci.A} | C: ${task.raci.C} | I: ${task.raci.I}`;
      card.appendChild(raci);

      const deps=document.createElement('div');
      deps.className='deps';
      deps.innerHTML='<span class="badge">Залежить від:</span> <span class="deps-list"></span>';
      card.appendChild(deps);

      const unl=document.createElement('div');
      unl.className='unlocks';
      unl.innerHTML='<span class="badge">Відкриває:</span> <span class="unlocks-list"></span>';
      card.appendChild(unl);

      const controls=document.createElement('div');
      controls.style.fontSize="11px";
      controls.innerHTML='<a href="#" class="edit">✏️</a> <a href="#" class="del">🗑</a>';
      controls.querySelector('.edit').onclick=(e)=>{e.preventDefault();openTaskModal({mode:'edit',task});};
      controls.querySelector('.del').onclick=(e)=>{e.preventDefault();deleteTask(task.id);};
      card.appendChild(controls);

      col.appendChild(card);
    });
  });

  makeLinks();
  applyDoneUI(new Set(DONE));
}

function makeLinks(){
  document.querySelectorAll('.task').forEach(card=>{
    const id=card.id;
    const depsWrap=card.querySelector('.deps-list');
    depsWrap.innerHTML="";
    const deps=(card.dataset.deps||"").split(',').filter(Boolean);
    deps.forEach((d,idx)=>{
      const span=document.createElement('span');
      span.className='linklike';
      span.textContent=TASKS.tasks.find(t=>t.id===d)?.title||d;
      span.onclick=()=>scrollToTask(d);
      span.setAttribute('data-dep-src',d);
      depsWrap.appendChild(span);
      if(idx<deps.length-1){depsWrap.appendChild(document.createTextNode(", "));}
    });
    const unlWrap=card.querySelector('.unlocks-list');
    unlWrap.innerHTML="";
    (revMap[id]||[]).forEach((u,idx)=>{
      const span=document.createElement('span');
      span.className='linklike';
      span.textContent=TASKS.tasks.find(t=>t.id===u)?.title||u;
      span.onclick=()=>scrollToTask(u);
      unlWrap.appendChild(span);
      if(idx<(revMap[id].length-1)){unlWrap.appendChild(document.createTextNode(", "));}
    });
  });
}

function scrollToTask(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'center'});
  el.classList.add('highlight');
  setTimeout(()=>el.classList.remove('highlight'),1000);
}

// ================== Done state ==================
function applyReady(set){
  document.querySelectorAll('.task').forEach(card=>{
    if(card.classList.contains('done')){card.classList.remove('ready');return;}
    const deps=(card.dataset.deps||"").split(',').filter(Boolean);
    if(deps.length===0||deps.every(d=>set.has(d))){card.classList.add('ready');}
    else card.classList.remove('ready');
  });
}
function applyDoneUI(set){
  document.querySelectorAll('.task').forEach(el=>{
    if(set.has(el.id)) el.classList.add('done'); else el.classList.remove('done');
  });
  document.querySelectorAll('.deps-list .linklike').forEach(el=>{
    const src=el.getAttribute('data-dep-src');
    if(src && set.has(src)) el.classList.add('dep-done'); else el.classList.remove('dep-done');
  });
  applyReady(set);
}
function toggleDone(id){
  const current=new Set(DONE);
  if(current.has(id)) current.delete(id); else current.add(id);
  DONE=Array.from(current);
  applyDoneUI(current);
  autoSaveState();
}
document.addEventListener('contextmenu',e=>{
  const card=e.target.closest('.task');
  if(card){e.preventDefault();toggleDone(card.id);}
},true);

// ================== Task CRUD ==================
function openTaskModal({mode='new',laneId=null,task=null}={}){
  const modal=document.getElementById('taskModal');
  modal.classList.remove('hidden');
  document.getElementById('taskModalTitle').textContent=mode==='edit'?"Редагувати таску":"Нова таска";

  const laneSel=document.getElementById('task_lane');
  laneSel.innerHTML="";
  TASKS.lanes.forEach(l=>{
    const opt=document.createElement('option');
    opt.value=l.id;opt.textContent=l.title;
    if((task&&task.lane===l.id)||(laneId===l.id)) opt.selected=true;
    laneSel.appendChild(opt);
  });

  const depSel=document.getElementById('task_deps');
  depSel.innerHTML="";
  TASKS.tasks.forEach(t=>{
    const opt=document.createElement('option');
    opt.value=t.id;opt.textContent=t.title;
    if(task&&(task.deps||[]).includes(t.id)) opt.selected=true;
    depSel.appendChild(opt);
  });

  document.getElementById('task_title').value=task?task.title:"";
  document.getElementById('task_id').value=task?task.id:"";
  document.getElementById('task_raci_R').value=task?task.raci.R:"";
  document.getElementById('task_raci_A').value=task?task.raci.A:"";
  document.getElementById('task_raci_C').value=task?task.raci.C:"";
  document.getElementById('task_raci_I').value=task?task.raci.I:"";

  document.getElementById('taskSaveBtn').onclick=()=>{
    const newTask={
      id:document.getElementById('task_id').value.trim(),
      title:document.getElementById('task_title').value.trim(),
      lane:document.getElementById('task_lane').value,
      deps:Array.from(depSel.selectedOptions).map(o=>o.value),
      raci:{
        R:document.getElementById('task_raci_R').value,
        A:document.getElementById('task_raci_A').value,
        C:document.getElementById('task_raci_C').value,
        I:document.getElementById('task_raci_I').value,
      },
      order:(task?task.order:(TASKS.tasks.filter(x=>x.lane===laneSel.value).length+1))
    };
    if(mode==='edit'){const idx=TASKS.tasks.findIndex(t=>t.id===task.id);TASKS.tasks[idx]=newTask;}
    else{TASKS.tasks.push(newTask);}
    closeTaskModal();
    renderTasks();
    autoSaveTasks();
  };
  document.getElementById('taskCancelBtn').onclick=closeTaskModal;
}
function closeTaskModal(){document.getElementById('taskModal').classList.add('hidden');}
function deleteTask(id){
  if(!confirm("Видалити таску "+id+"?")) return;
  TASKS.tasks=TASKS.tasks.filter(t=>t.id!==id);
  renderTasks();
  autoSaveTasks();
}

// ================== GitHub Sync ==================
const els=()=>({
  repo:document.getElementById('gh_repo'),
  branch:document.getElementById('gh_branch'),
  tasksPath:document.getElementById('gh_tasks_path'),
  statePath:document.getElementById('gh_state_path'),
  token:document.getElementById('gh_token'),
  load:document.getElementById('btn_load'),
  save:document.getElementById('btn_save'),
  status:document.getElementById('gh_status')
});
function cfgGet(){try{return JSON.parse(localStorage.getItem('ghSyncCfg.v1')||'{}');}catch(e){return{};}}
function cfgSet(o){localStorage.setItem('ghSyncCfg.v1',JSON.stringify(o));}
function readCfg(){
  const $=els();
  const repo=$.repo.value.trim();
  const branch=$.branch.value.trim()||'main';
  const tasksPath=$.tasksPath.value.trim()||'tasks.json';
  const statePath=$.statePath.value.trim()||'state.json';
  const token=$.token.value.trim();
  cfgSet({repo,branch,tasksPath,statePath,token});
  return {repo,branch,tasksPath,statePath,token};
}
function showStatus(msg,ok=true){const $=els();$.status.textContent=msg;$.status.style.color=ok?'#9cc7a7':'#ff9f9f';}
async function ghGet(repo,path,ref,token){
  const url=`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;
  const headers={'Accept':'application/vnd.github+json','Cache-Control':'no-cache'};
  if(token) headers['Authorization']=`Bearer ${token}`;
  const r=await fetch(url,{headers});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}
async function ghPut(repo,path,branch,token,content,sha){
  const url=`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const headers={'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`};
  const body={
    message:"Update "+path,
    branch,
    content:b64encode(content),
    ...(sha?{sha}:{}),
  };
  const r=await fetch(url,{method:'PUT',headers,body:JSON.stringify(body)});
  if(!r.ok){const t=await r.text();throw new Error('HTTP '+r.status+': '+t);}
  return r.json();
}
async function loadAll({quiet=false}={}){
  const {repo,branch,tasksPath,statePath,token}=readCfg();
  if(!repo||!branch||!tasksPath||!statePath||!token){showStatus("Заповни всі поля",false);return;}
  try{
    showStatus("Завантажую...");
    const tdata=await ghGet(repo,tasksPath,branch,token);
    const tasks=JSON.parse(b64decode(tdata.content));
    TASKS=tasks;
    const sdata=await ghGet(repo,statePath,branch,token);
    let json=JSON.parse(b64decode(sdata.content));
    if(Array.isArray(json)) DONE=json; else if(json && Array.isArray(json.done)) DONE=json.done; else DONE=[];
    buildUI();applyDoneUI(new Set(DONE));
    showStatus("Завантажено!");
  }catch(e){showStatus("Помилка завантаження: "+e.message,false);}
}
async function saveAll(){
  const {repo,branch,tasksPath,statePath,token}=readCfg();
  if(!repo||!branch||!tasksPath||!statePath||!token){showStatus("Заповни всі поля",false);return;}
  try{
    showStatus("Зберігаю...");
    // отримуємо sha перед оновленням
    let tsha=null,ssha=null;
    try{const i=await ghGet(repo,tasksPath,branch,token);tsha=i.sha;}catch(e){}
    try{const i=await ghGet(repo,statePath,branch,token);ssha=i.sha;}catch(e){}
    await ghPut(repo,tasksPath,branch,token,JSON.stringify(TASKS,null,2),tsha);
    await ghPut(repo,statePath,branch,token,JSON.stringify({done:DONE,updatedAt:new Date().toISOString()},null,2),ssha);
    showStatus("Збережено!");
  }catch(e){showStatus("Помилка збереження: "+e.message,false);}
}
let autoSaveTimer=null;
function autoSaveTasks(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(saveAll,1000);}
function autoSaveState(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(saveAll,1000);}
document.addEventListener('DOMContentLoaded',()=>{
  els().load.onclick=()=>loadAll();
  els().save.onclick=()=>saveAll();
  const c=cfgGet();
  if(c.repo){els().repo.value=c.repo;els().branch.value=c.branch;els().tasksPath.value=c.tasksPath;els().statePath.value=c.statePath;els().token.value=c.token;}
  if(c.repo && c.token) loadAll({quiet:true});
  setInterval(()=>loadAll({quiet:true}),60000);
});
