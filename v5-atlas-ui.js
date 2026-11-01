/* FIT55 5.2 – focused, searchable visual exercise atlas.
 * Uses FIT55_ATLAS_DATA and FIT55_DATA. No user measurements are transmitted. */
(function(g){
"use strict";
const A=g.FIT55_ATLAS_DATA,D=g.FIT55_DATA;
if(!A||!D)return;
const items=A.ITEMS, byKey=new Map(items.map(x=>[x.key,x]));
const planIds=new Set(D.BASE.flatMap(x=>x.ids));
const storageKey="fit55-gym-bookmarks-v1";
let bookmarks=new Set();
try{let a=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(a))bookmarks=new Set(a)}catch(_){}
const st={mode:"all",goal:"all",muscle:"",equipment:"",level:"",query:"",day:"all",sort:"recommended"};
const labels={all:"Tất cả",plan:"Trong lịch FIT55",saved:"Đã lưu"};
const equipment=["Máy","Máy / cáp","Tạ tự do","Dây kháng lực","Thể trọng"];
const levels=["Cơ bản","Trung cấp","Nâng cao"];
const dayLabels=["Glutes A · Thứ 2","Pull · Thứ 3","Glutes B · Thứ 5","Push · Thứ 6"];
const planOrder=new Map();
D.BASE.forEach((day,di)=>day.ids.forEach((id,i)=>{
 if(!planOrder.has(id))planOrder.set(id,{day:di,order:i,dayLabel:dayLabels[di]});
}));
const norm=s=>String(s??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[-_]+/g," ").replace(/\s+/g," ").trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function pics(x){
 const base=A.PICTURE_BASE+encodeURIComponent(x.slug);
 if(/(^|-)plank$|hollow-body-hold|dumbbell-farmers-walk/.test(x.slug)||["plank","side-plank"].includes(x.slug))return [[base+"-main.webp","Giữ tư thế"]];
 return [[base+"-start.webp","Tư thế bắt đầu"],[base+"-peak.webp","Tư thế kết thúc"]];
}
function planItem(x){return Boolean(x.fitId&&planIds.has(x.fitId))}
function planDescription(x){
 if(!planItem(x))return"";
 const list=D.BASE.flatMap((day,di)=>day.ids.map((id,i)=>id===x.fitId?{di,i}:null).filter(Boolean));
 return list.map(t=>dayLabels[t.di]+" · bài "+(t.i+1)).join(" · ");
}
function filtered(){
 let arr=items.filter(x=>{
  if(st.mode==="plan"&&!planItem(x))return false;
  if(st.mode==="saved"&&!bookmarks.has(x.key))return false;
  if(st.mode==="plan"&&st.day!=="all"){
   let day=D.BASE[Number(st.day)];
   if(!day||!day.ids.includes(x.fitId))return false;
  }
  if(st.goal!=="all"&&!A.GOAL_GROUPS.find(y=>y.id===st.goal)?.groups.includes(x.muscle))return false;
  if(st.muscle&&st.muscle!==x.muscle)return false;
  if(st.equipment&&x.kind!==st.equipment)return false;
  if(st.level&&x.level!==st.level)return false;
  let q=norm(st.query);
  return !q||norm([x.en,x.key,x.vi,x.muscle,x.kind,x.pattern].join(" ")).includes(q);
 });
 arr.sort((a,b)=>{
  if(st.mode==="plan"){let x=planOrder.get(a.fitId),y=planOrder.get(b.fitId);return (x?.day??9)-(y?.day??9)||(x?.order??9)-(y?.order??9)}
  if(st.sort==="az")return a.en.localeCompare(b.en);
  if(st.sort==="group")return A.GROUPS.indexOf(a.muscle)-A.GROUPS.indexOf(b.muscle)||a.en.localeCompare(b.en);
  const p=x=>planItem(x)?-2:x.muscle==="Mông"?-1:0;
  return p(a)-p(b)||A.GROUPS.indexOf(a.muscle)-A.GROUPS.indexOf(b.muscle)||a.en.localeCompare(b.en);
 });
 return arr;
}
const currentCount=()=>items.filter(planItem).length;
function card(x){
 const img=pics(x)[0][0],inPlan=planItem(x),fav=bookmarks.has(x.key);
 return '<article class="atlas-card">'+
 '<button type="button" class="atlas-cover" data-atlas-open="'+esc(x.key)+'" aria-label="Mở hướng dẫn bài '+esc(x.en)+'">'+
 '<div class="atlas-media"><img class="atlas-thumb" loading="lazy" decoding="async" src="'+esc(img)+'" alt="Minh họa '+esc(x.en)+'"><span class="atlas-photo-number">01 / '+pics(x).length+'</span></div>'+
 '<div class="atlas-card-body"><span class="atlas-muscle">'+esc(x.muscle)+'</span><h3>'+esc(x.en)+'</h3><p>'+esc(x.vi)+'</p>'+
 '<div class="atlas-pills"><span>'+esc(x.kind)+'</span><span>'+esc(x.level)+'</span>'+(inPlan?'<span class="atlas-plan-pill">Trong lịch FIT55</span>':'')+'</div></div></button>'+
 '<button type="button" class="atlas-heart" data-atlas-save="'+esc(x.key)+'" aria-pressed="'+fav+'" aria-label="'+(fav?'Bỏ lưu ':'Lưu ')+esc(x.en)+'">'+(fav?'♥':'♡')+'</button></article>';
}
function listHtml(arr){
 return arr.length?arr.map(card).join(""):'<div class="atlas-empty"><div aria-hidden="true">⌕</div><h3>Chưa tìm thấy bài phù hợp</h3><p>Thử thay nhóm cơ, bỏ bộ lọc dụng cụ hoặc xóa ô tìm kiếm.</p><button type="button" data-atlas-clear class="btn">Đặt lại bộ lọc</button></div>';
}
function modeHtml(){
 return Object.entries(labels).map(([id,label])=>'<button type="button" class="atlas-mode '+(st.mode===id?'active':'')+'" data-atlas-mode="'+id+'" aria-pressed="'+(st.mode===id)+'">'+label+'</button>').join("");
}
function goalHtml(){
 return '<button class="atlas-goal '+(st.goal==="all"?"active":"")+'" data-atlas-goal="all" aria-pressed="'+(st.goal==="all")+'">Tất cả nhóm</button>'+
 A.GOAL_GROUPS.map(x=>'<button class="atlas-goal '+(st.goal===x.id?'active':'')+'" data-atlas-goal="'+esc(x.id)+'" aria-pressed="'+(st.goal===x.id)+'">'+esc(x.label)+'</button>').join("");
}
function dayHtml(){
 return '<div id="atlas-daybar" class="atlas-daybar" '+(st.mode!=="plan"?"hidden":"")+'><strong>Chọn buổi trong lịch</strong><div><button type="button" data-atlas-day="all" class="atlas-day '+(st.day==="all"?"active":"")+'">Tất cả 4 buổi</button>'+
 D.BASE.map((d,i)=>'<button type="button" data-atlas-day="'+i+'" class="atlas-day '+(st.day===String(i)?"active":"")+'">'+esc(dayLabels[i])+'</button>').join("")+'</div></div>';
}
function options(list,val){return list.map(x=>'<option value="'+esc(x)+'" '+(val===x?"selected":"")+'>'+esc(x)+'</option>').join("")}
function render(){
 const arr=filtered();
 return '<section id="atlas-app" class="atlas-v2 stack">'+
 '<header class="atlas-hero"><div class="atlas-overline">FIT55 · VISUAL MOVEMENT ATLAS</div><div class="atlas-hero-row"><div><h1>Thư viện hình bài tập</h1>'+
 '<p>Tra cứu trực quan theo mục tiêu, nhóm cơ và thiết bị. Xem hai tư thế, kỹ thuật, nhịp thở, lỗi cần tránh và bài thay thế ngay trong một chỗ.</p></div>'+
 '<div class="atlas-hero-stat"><strong>'+items.length+'<span> bài</span></strong><small>Thư viện mở rộng</small></div></div>'+
 '<div class="atlas-hero-stats"><span><b>'+currentCount()+'</b> bài thuộc giáo án hiện tại</span><span><b>'+A.GROUPS.length+'</b> nhóm cơ</span><span><b>'+bookmarks.size+'</b> bài đã lưu</span></div></header>'+
 '<div class="atlas-quick-note"><b>Định hướng của bạn:</b> ưu tiên duy trì hoặc cải thiện cơ mông; tập tay, đùi và core để giữ sức mạnh khi giảm mỡ tổng thể. Tập từng vùng không làm mỡ ở vùng đó giảm riêng.</div>'+
 '<div class="atlas-control-panel">'+
 '<div class="atlas-section-label">01 · Chọn mục tiêu</div><nav class="atlas-goal-scroll" aria-label="Lọc theo mục tiêu">'+goalHtml()+'</nav>'+
 '<div class="atlas-primary-filter"><div class="atlas-search"><span aria-hidden="true">⌕</span><input type="search" id="atlas-query" class="field" placeholder="Tìm tên bài, nhóm cơ, máy tập..." value="'+esc(st.query)+'" autocomplete="off" aria-label="Tìm kiếm bài tập"></div>'+
 '<div class="atlas-selects"><label><span>Nhóm cơ</span><select id="atlas-muscle" class="field"><option value="">Tất cả nhóm cơ</option>'+options(A.GROUPS,st.muscle)+'</select></label>'+
 '<label><span>Thiết bị</span><select id="atlas-equipment" class="field"><option value="">Mọi dụng cụ</option>'+options(equipment,st.equipment)+'</select></label>'+
 '<label><span>Độ khó</span><select id="atlas-level" class="field"><option value="">Mọi mức</option>'+options(levels,st.level)+'</select></label></div></div>'+
 '<div class="atlas-mode-bar">'+modeHtml()+'<label class="atlas-sort-label">Sắp xếp <select id="atlas-sort"><option value="recommended" '+(st.sort==="recommended"?"selected":"")+'>Đề xuất</option><option value="group" '+(st.sort==="group"?"selected":"")+'>Nhóm cơ</option><option value="az" '+(st.sort==="az"?"selected":"")+'>Tên A–Z</option></select></label></div>'+
 dayHtml()+
 '<div class="atlas-count-row"><b id="atlas-count" aria-live="polite">'+arr.length+' bài phù hợp</b><button type="button" data-atlas-clear class="atlas-clear">Xóa bộ lọc</button></div>'+
 '</div>'+
 '<div id="atlas-grid" class="atlas-grid">'+listHtml(arr)+'</div>'+
 '<footer class="atlas-footer">Hình hai tư thế do <a href="'+esc(A.LICENSE)+'" target="_blank" rel="noopener noreferrer">RepDB</a> phát hành và được sử dụng có ghi nguồn. Danh sách được biên tập mở rộng riêng cho FIT55, không chỉ sao chép mẫu PDF. Ảnh là minh họa, không thay cho hướng dẫn an toàn của huấn luyện viên.</footer></section>';
}
function refresh(repaintButtons=false){
 const root=document.getElementById("atlas-app");if(!root)return;
 const arr=filtered();
 const grid=document.getElementById("atlas-grid"),count=document.getElementById("atlas-count");
 if(grid)grid.innerHTML=listHtml(arr);
 if(count)count.textContent=arr.length+" bài phù hợp";
 if(repaintButtons){
  let nav=root.querySelector(".atlas-goal-scroll"),m=root.querySelector(".atlas-mode-bar");
  if(nav)nav.innerHTML=goalHtml();
  if(m){const sort=m.querySelector(".atlas-sort-label")?.outerHTML||"";m.innerHTML=modeHtml()+sort}
  let day=root.querySelector("#atlas-daybar");
  if(day)day.outerHTML=dayHtml();
 }
}
function detail(key){
 const x=byKey.get(key);if(!x)return;
 const ref=D.EXERCISES[x.fitId]||null;
 const steps=ref?.steps?.length?ref.steps:x.steps;
 const setup=ref?.setup||("Thiết lập "+x.kind.toLowerCase()+" phù hợp chiều cao và mức tải. Bắt đầu với biên độ thoải mái.");
 const breathing=ref?.breath||x.breathing;
 const errors=ref?.errors||x.mistakes;
 const safety=x.note?"Ảnh tham khảo là biến thể gần tương đương: "+x.note+" "+x.safety:x.safety;
 const rec=items.filter(y=>y.key!==x.key&&y.muscle===x.muscle).slice(0,4);
 const guide=ref?'<div class="atlas-guide-badge">Có hướng dẫn chuyên sâu FIT55</div>':'<div class="atlas-guide-badge neutral">Bài mở rộng · hướng dẫn cơ bản</div>';
 const images=pics(x);
 const html='<div class="modalback" role="presentation"><div class="modal wide" role="dialog" aria-modal="true" aria-label="'+esc(x.en)+'"><div class="modalhead"><div><small class="atlas-modal-overline">'+esc(x.muscle)+' · '+esc(x.level)+'</small><h2>'+esc(x.en)+'</h2><p class="atlas-modal-vn">'+esc(x.vi)+'</p></div><button type="button" class="roundbtn" data-close-modal aria-label="Đóng">×</button></div><div class="modalbody atlas-detail">'+
 guide+'<div class="atlas-detail-visual">'+images.map(([url,label])=>'<figure><img loading="eager" decoding="async" src="'+esc(url)+'" alt="'+esc(x.en)+' — '+esc(label)+'" class="atlas-detail-photo"><figcaption>'+esc(label)+'</figcaption></figure>').join("")+'</div>'+
 '<div class="atlas-detail-stats"><span><b>Nhóm cơ</b>'+esc(x.muscle)+'</span><span><b>Dụng cụ</b>'+esc(x.kind)+'</span><span><b>Độ khó</b>'+esc(x.level)+'</span></div>'+
 (planItem(x)?'<p class="atlas-plan-info"><b>Trong giáo án:</b> '+esc(planDescription(x))+'</p>':'')+
 '<section class="atlas-coaching"><h3>Tại sao tập bài này?</h3><p>'+esc(ref?.why||x.goal)+'</p></section>'+
 '<section class="atlas-coaching"><h3>Chuẩn bị đúng</h3><p>'+esc(setup)+'</p></section>'+
 '<section class="atlas-coaching"><h3>4 bước thực hiện</h3><ol>'+steps.map(p=>'<li>'+esc(p)+'</li>').join("")+'</ol></section>'+
 '<div class="atlas-guide-twocol"><section><h3>Nhịp thở</h3><p>'+esc(breathing)+'</p></section><section><h3>Lỗi thường gặp</h3><p>'+esc(errors)+'</p></section></div>'+
 '<div class="atlas-safety"><b>Lưu ý an toàn:</b> '+esc(safety)+'</div>'+
 (ref?'<button type="button" class="btn primary" data-ex-open="'+esc(x.fitId)+'">Xem hướng dẫn kỹ thuật FIT55 đầy đủ →</button>':'')+
 '<section class="atlas-related"><h3>Có thể xem thêm</h3><div>'+rec.map(v=>'<button type="button" class="atlas-related-button" data-atlas-open="'+esc(v.key)+'">'+esc(v.en)+'</button>').join("")+'</div></section>'+
 '<p class="atlas-attribution">Illustrations: <a href="'+esc(A.LICENSE)+'" target="_blank" rel="noopener noreferrer">Exercise data by RepDB (repdb.co)</a></p></div></div></div>';
 document.getElementById("modalroot").innerHTML=html;
 document.body.style.overflow="hidden";
 document.querySelector("#modalroot [data-close-modal]")?.focus();
}
function clearFilters(){
 st.goal="all";st.muscle="";st.equipment="";st.level="";st.query="";st.day="all";
 const root=document.getElementById("atlas-app");if(!root)return;
 root.querySelector("#atlas-query").value="";
 root.querySelector("#atlas-muscle").value="";
 root.querySelector("#atlas-equipment").value="";
 root.querySelector("#atlas-level").value="";
 refresh(true);
}
function save(id){
 if(bookmarks.has(id))bookmarks.delete(id);else bookmarks.add(id);
 try{localStorage.setItem(storageKey,JSON.stringify([...bookmarks]))}catch(_){}
 refresh();
 const root=document.getElementById("atlas-app");
 if(root){
  const counter=root.querySelector(".atlas-hero-stats span:last-child b");
  if(counter)counter.textContent=String(bookmarks.size);
 }
}
document.addEventListener("click",ev=>{
 const tar=ev.target.closest?.("[data-atlas-open],[data-atlas-save],[data-atlas-mode],[data-atlas-goal],[data-atlas-day],[data-atlas-clear],[data-atlas-fit]");
 if(!tar)return;
 if(tar.hasAttribute("data-atlas-open")){detail(tar.dataset.atlasOpen);return}
 if(tar.hasAttribute("data-atlas-fit")){let x=items.find(v=>v.fitId===tar.dataset.atlasFit);if(x)detail(x.key);return}
 if(!document.getElementById("atlas-app"))return;
 if(tar.hasAttribute("data-atlas-save")){save(tar.dataset.atlasSave);return}
 if(tar.hasAttribute("data-atlas-mode")){st.mode=tar.dataset.atlasMode;st.day="all";refresh(true);return}
 if(tar.hasAttribute("data-atlas-goal")){st.goal=tar.dataset.atlasGoal;st.muscle="";let sel=document.getElementById("atlas-muscle");if(sel)sel.value="";refresh(true);return}
 if(tar.hasAttribute("data-atlas-day")){st.day=tar.dataset.atlasDay;refresh(true);return}
 if(tar.hasAttribute("data-atlas-clear")){clearFilters();return}
});
document.addEventListener("input",ev=>{
 if(ev.target?.id==="atlas-query"){st.query=ev.target.value;refresh()}
});
document.addEventListener("change",ev=>{
 const id=ev.target?.id,value=ev.target?.value;
 if(id==="atlas-muscle"){st.muscle=value;st.goal="all";refresh(true)}
 else if(id==="atlas-equipment"){st.equipment=value;refresh()}
 else if(id==="atlas-level"){st.level=value;refresh()}
 else if(id==="atlas-sort"){st.sort=value;refresh()}
});
document.addEventListener("error",ev=>{
 const img=ev.target;
 if(img?.matches?.(".atlas-thumb,.atlas-detail-photo")){
  const p=document.createElement("div");
  p.className="atlas-no-photo";p.textContent="Hình minh họa chưa tải được";
  img.replaceWith(p);
 }
},true);
function imageForFit(id){
 const x=items.find(z=>z.fitId===id);
 return x?pics(x)[0][0]:null;
}
function fitSnippet(id){
 const x=items.find(z=>z.fitId===id);
 if(!x)return"";
 return '<div class="atlas-inline-visual"><button type="button" data-atlas-fit="'+esc(id)+'" aria-label="Xem hình minh họa '+esc(x.en)+'"><img loading="lazy" decoding="async" src="'+esc(pics(x)[0][0])+'" alt="Minh họa '+esc(x.en)+'"><span>▧ Xem hình & kỹ thuật</span></button></div>';
}
g.FIT55_ATLAS_UI={render,detail,imageForFit,fitSnippet,items,filtered,version:"5.2"};
})(window);
