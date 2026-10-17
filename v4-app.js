/* FIT55 4.0 — integrated journey application; GitHub Pages / vanilla JS */
(function(){
'use strict';
const D=window.FIT55_DATA;if(!D)throw new Error('Missing FIT55 data library');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateNow=()=>{let x=new Date();return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')};
const num=(n,d=1)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';
const vnum=(x,defaultValue=null)=>x===''||x===null||x===undefined?defaultValue: Number.isFinite(+x)?+x:defaultValue;
const STORE='fit55-v4';const BASE={date:'2026-10-16',weight:63.3,fat:20.2,muscle:23.5,pbf:31.9,water:31.6,source:'InBody gốc'};
const defaultProfile={target:55,calories:1695,protein:110,carb:190,fat:55,workoutTime:'19:30',sleepTime:'23:00',firstMeal:'13:30',lastMeal:'21:30',startDate:'2026-10-19',goals:{}};
function originalRaw(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function migrateLegacy(){
const old=originalRaw('fit55-v1'),oldProfile=originalRaw('fit55-profile-v2');
let state={version:4,measurements:[BASE],meals:[],workouts:{},checkins:[],overrides:{},profile:{...defaultProfile},archive:{workouts:{},meals:[]}};
if(old&&Array.isArray(old.measurements)){
const a=old.measurements.filter(x=>x&&typeof x.date==='string'&&Number.isFinite(+x.weight));
state.measurements=a.length?a:[BASE];
if(!state.measurements.some(x=>x.date===BASE.date))state.measurements.unshift(BASE);
if(Array.isArray(old.food))state.archive.meals=old.food;
if(old.workouts&&typeof old.workouts==='object')state.archive.workouts=old.workouts;
}
if(oldProfile&&typeof oldProfile==='object'&&!Array.isArray(oldProfile)){
for(const [before,after] of [['kcal','calories'],['protein','protein'],['gym','workoutTime'],['sleep','sleepTime'],['firstmeal','firstMeal'],['lastmeal','lastMeal']]){
if(oldProfile[before]!==undefined)state.profile[after]=oldProfile[before];
}
if(Array.isArray(oldProfile.recovery)){
state.checkins=oldProfile.recovery.map(x=>({date:x.date,pain:+x.pain||0,energy:x.energy||'normal',sleep:x.sleep||'',note:x.note||'',legacy:true}));
}
}
return state;
}
function read(){
const existing=originalRaw(STORE);
if(existing&&existing.version===4&&existing.profile&&Array.isArray(existing.measurements)&&existing.workouts){
return {...existing,meals:existing.meals||[],checkins:existing.checkins||[],overrides:existing.overrides||{},archive:existing.archive||{workouts:{},meals:[]},profile:{...defaultProfile,...existing.profile,goals:existing.profile.goals||{}}};
}
return migrateLegacy();
}
let state=read();
function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){toast('Không thể lưu trên trình duyệt. Hãy xuất bản sao lưu và kiểm tra dung lượng.')} }
save();
let section='today',selectedWeek=weekToday(),selectedDay=nextDay(),trainingDate=dateNow(),detailFilter='',detailMuscle='',nutritionDate=dateNow(),nutritionMode='training',chartMeasure='weight';
const NAV=[
{id:'today',label:'Tổng quan',short:'Hôm nay',icon:'⌂'},
{id:'training',label:'Lộ trình & buổi tập',short:'Tập luyện',icon:'▦'},
{id:'library',label:'Thư viện kỹ thuật',short:'Bài tập',icon:'◈'},
{id:'goals',label:'Mục tiêu & số đo',short:'Mục tiêu',icon:'◎'},
{id:'nutrition',label:'Dinh dưỡng & sinh hoạt',short:'Dinh dưỡng',icon:'♧'}];
const SECTION_TEXT={today:['My Body Journey','Hôm nay & kế hoạch'],training:['Training Plan','Lộ trình và buổi tập'],library:['Movement Library','Thư viện kỹ thuật'],goals:['Body Goals','Mục tiêu và số đo'],nutrition:['Nutrition & Lifestyle','Dinh dưỡng và sinh hoạt']};
function dayInLocal(s){return new Date(s+'T12:00:00')}
function weekToday(){const start=dayInLocal(state.profile.startDate||defaultProfile.startDate);const d=dayInLocal(dateNow());return Math.max(1,Math.min(D.MAX_WEEKS||36,Math.floor((d-start)/604800000)+1))}
function nextDay(){let day=new Date().getDay(),hour=new Date().getHours();let options=D.BASE.map((x,i)=>({i,gap:(x.day-day+7)%7}));let available=options.filter(x=>x.gap>0||hour<20);available.sort((a,b)=>a.gap-b.gap);return (available[0]||options[0]).i}
function measures(){return [...state.measurements].sort((a,b)=>a.date.localeCompare(b.date))}
function latest(key='weight'){return measures().filter(x=>x[key]!==undefined&&x[key]!==null&&x[key]!=='').at(-1)||null}
function latestWeight(){return vnum(latest('weight')?.weight,63.3)}
function agoWeight(){return Math.max(0,63.3-latestWeight())}
function progressPct(){return Math.max(0,Math.min(100,100*(63.3-latestWeight())/(63.3-state.profile.target||8.3)))}
function activeWorkout(){return D.workoutOf(selectedWeek,selectedDay)}
function weekStartNumber(n){let x=dayInLocal(state.profile.startDate);x.setDate(x.getDate()+(n-1)*7);return x.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'})}
function icon(name){const m={today:'⌂',training:'▦',library:'◈',goals:'◎',nutrition:'♧'};return m[name]||'✦'}
function money(v){return Math.round(v).toLocaleString('vi-VN')}
function showToastHtml(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(showToastHtml.timer);showToastHtml.timer=setTimeout(()=>el.classList.remove('show'),2900)}
function toast(t){showToastHtml(t)}
function modal(title,body,footer='',wide=false){
$('#modalroot').innerHTML='<div class="modalback" role="presentation"><div class="modal '+(wide?'wide':'')+'" role="dialog" aria-modal="true" aria-label="'+escape(title)+'"><div class="modalhead"><h2>'+escape(title)+'</h2><button type="button" class="roundbtn" data-close-modal aria-label="Đóng">×</button></div><div class="modalbody">'+body+'</div>'+(footer?'<div class="modalfoot">'+footer+'</div>':'')+'</div></div>';
document.body.style.overflow='hidden';
const x=$('#modalroot .modalback');x.onclick=e=>{if(e.target===x)closeModal()};
$('#modalroot [data-close-modal]').onclick=closeModal;
const focus=$('#modalroot .roundbtn');focus?.focus();
}
function closeModal(){$('#modalroot').innerHTML='';document.body.style.overflow=''}
function impactBars(ex){return '<div class="impacts">'+ex.impact.map(([m,r])=>'<div class="barline"><span>'+escape(m)+'</span><div class="track"><span style="width:'+(r*20)+'%;"></span></div><strong>'+r+'/5</strong></div>').join('')+'</div><p class="meta">Mức độ nhấn mạnh tương đối trong chương trình, không phải kết quả đo hoạt hóa cơ (EMG).</p>'}
function exDetail(id,fromWorkout=false,index=0){
const e=D.EXERCISES[id];if(!e)return;
let w=activeWorkout(),prescribedSets=fromWorkout&&w.exercises[index]?w.exercises[index].sets:e.sets,alts=e.alternatives.map(x=>D.EXERCISES[x]?'<button class="btn small" data-ex-open="'+x+'">'+escape(D.EXERCISES[x].name)+'</button>':'').join('');
modal(e.name+' · '+e.vn,'<div class="exercise-detail stack"><div class="tags"><span class="pill rose">Chính: '+escape(e.primary)+'</span>'+e.secondary.map(x=>'<span class="pill lav">Phụ: '+escape(x)+'</span>').join('')+'<span class="pill">'+escape(e.equipment)+'</span></div><div class="detailgrid"><div class="tile"><div class="micro">Vai trò & hình thể</div><p>'+escape(e.why)+'</p></div><div class="tile"><div class="micro">Tập thế nào?</div><p><b>'+prescribedSets+' set · '+escape(e.range)+'</b> · nghỉ khoảng '+e.rest+' giây. Tạ theo log thực tế và kỹ thuật.</p></div></div><div class="detailgrid"><div class="card soft"><h3>Nhóm cơ tác động</h3>'+impactBars(e)+'</div><div class="card soft"><h3>Mức tạ tham khảo</h3><p>'+escape(e.load)+'</p><p style="margin-top:9px"><b>Gợi ý từ nhật ký:</b> '+escape(progressionAdvice(id,e))+'</p><div class="spacer"></div><p><b>Nguyên tắc tăng tạ:</b> hoàn thành giới hạn reps trên ở tất cả set, còn khoảng 2 reps dự phòng, không đau khớp → tăng một nấc nhỏ ở buổi sau. Với assisted pull-up, trợ lực ít hơn là khó hơn.</p></div></div><div class="kicker">Chuẩn bị / Setup</div><p>'+escape(e.setup)+'</p><div class="kicker">Từng bước thực hiện</div><div>'+e.steps.map((x,i)=>'<div class="tiprow"><span class="n">'+(i+1)+'</span><p>'+escape(x)+'</p></div>').join('')+'</div><div class="detailgrid"><div class="tile"><div class="micro">Hít thở</div><p>'+escape(e.breath)+'</p></div><div class="tile"><div class="micro">Điểm cần cảm nhận</div><p>'+escape(e.cues)+'</p></div></div><div class="notice amber"><b>Tránh:</b> '+escape(e.errors)+'</div><div class="kicker">Bài thay thế</div><div class="actions">'+alts+'</div>'+(fromWorkout?'<div class="notice">Đổi bài chỉ áp dụng cho ô bài số '+(index+1)+' của tuần '+selectedWeek+', '+w.label+'. Các tuần khác không bị thay đổi.</div><div class="actions">'+e.alternatives.filter(x=>D.EXERCISES[x]).map(x=>'<button class="btn small" data-replace="'+selectedWeek+'|'+selectedDay+'|'+index+'|'+x+'">Dùng '+escape(D.EXERCISES[x].name)+' cho buổi này</button>').join('')+'</div>':'')+'</div>');
}
function card(title,inner,subtitle=''){return '<section class="card"><div class="paneltitle"><div><h3>'+title+'</h3>'+(subtitle?'<p class="meta">'+subtitle+'</p>':'')+'</div></div>'+inner+'</section>'}
function heading(kicker,title,desc='',right=''){return '<div class="pageheader"><div><div class="micro">'+kicker+'</div><h2>'+title+'</h2>'+(desc?'<p>'+desc+'</p>':'')+'</div>'+right+'</div>'}
function view(id){section=id;$('.crumb').textContent=SECTION_TEXT[id][0];$('.pagetitle').textContent=SECTION_TEXT[id][1];$$('[data-nav]').forEach(x=>{x.classList.toggle('active',x.dataset.nav===id);if(x.dataset.nav===id)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});render();window.scrollTo({top:0,behavior:'instant'})}
function render(){const v=$('#view');try{v.innerHTML={today:renderToday,training:renderTraining,library:renderLibrary,goals:renderGoals,nutrition:renderNutrition}[section]()}catch(e){console.error(e);v.innerHTML='<div class="notice red">Không thể tải phần này. Hãy thử làm mới trang hoặc khôi phục từ bản sao lưu.</div>'}}
function renderLayout(){
const n=$('#side-nav'),m=$('#mobilebar');
n.innerHTML=NAV.map(x=>'<button type="button" class="navbtn" data-nav="'+x.id+'">'+icon(x.id)+' <span>'+x.label+'</span> ›</button>').join('')+'<div class="sidecaption" style="margin-top:24px">TIỆN ÍCH</div><button class="navbtn" data-open-data>↓ <span>Sao lưu & thiết lập</span> ›</button>';
m.innerHTML=NAV.map(x=>'<button type="button" class="mobilebtn" data-nav="'+x.id+'"><span style="font-size:20px">'+icon(x.id)+'</span><span>'+x.short+'</span></button>').join('');
$('.datechip').textContent=new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit'});
}
function shortInput(label,id,value,min=0,max=250,step='.1',hint=''){return '<div class="formitem"><label for="'+id+'">'+label+'</label><input class="field" id="'+id+'" type="number" step="'+step+'" min="'+min+'" max="'+max+'" value="'+escape(value??'')+'" />'+(hint?'<small>'+hint+'</small>':'')+'</div>'}
function renderToday(){
const w=D.workoutOf(weekToday(),nextDay()),lw=latestWeight(),pct=progressPct();
let lastCheck=[...state.checkins].sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
let checkMsg=lastCheck?.pain>=3?'Nếu đau nhiều ảnh hưởng sinh hoạt, nghỉ tập và cân nhắc đánh giá y tế.':lastCheck?.pain>=2?'Giảm tải, hoặc đổi buổi và chỉ tập vùng không đau rõ.':lastCheck?.energy==='low'?'Nếu hôm nay ít năng lượng, giảm số set và cardio.':'Nếu phục hồi tốt, tập theo mức RIR dự kiến của tuần.';
return '<div class="stack"><div class="hero"><div><div class="micro">FIT55 · PERSONAL WELLNESS</div><h1>Stronger every week.<br><em>Lighter at your pace.</em></h1><p>Đặt mục tiêu, theo dõi cơ thể và tập có chủ đích. Lộ trình 28 tuần + 8 tuần tùy chọn; không phải thời hạn bắt buộc để đạt 55 kg.</p><div class="actions" style="margin-top:18px"><button class="btn primary" data-nav="training">Xem lịch tập tuần này →</button><button class="btn" data-nav="goals">Mục tiêu & số đo</button></div></div><div class="hero-circle" style="--angle:'+num(pct,1)+'%"><div class="hero-circle-inner"><span>GOAL WEIGHT</span><strong>'+num(state.profile.target)+'</strong><small>kg · đã đi '+num(pct,1)+'%</small></div></div></div><div class="grid g4">'+[
['Cân mới nhất',num(lw,2)+' kg','Cân gốc 63.3 kg'],['Khoảng cách mục tiêu',num(Math.max(0,lw-state.profile.target),2)+' kg','Mốc '+num(state.profile.target)+' kg linh hoạt'],['Mỡ cơ thể',num(latest('fat')?.fat)+' kg','InBody gần nhất · không kết luận từ 1 lần'],['Cơ xương',num(latest('muscle')?.muscle)+' kg','Ưu tiên duy trì sức mạnh']
].map(x=>'<div class="card stat"><div class="statlabel">'+x[0]+'</div><div class="statnum">'+x[1]+'</div><div class="meta">'+x[2]+'</div></div>').join('')+'</div><div class="grid g2"><div class="card peach stack"><div class="micro">NEXT WORKOUT · '+w.label+'</div><h2>'+w.code+' — '+w.title+'</h2><p class="quiet">'+w.intro+'</p><div class="tags"><span class="pill rose">19:30</span><span class="pill">45 phút tập tạ</span><span class="pill mint">Cardio linh hoạt</span></div><div class="meta">Tuần '+weekToday()+'/'+(weekToday()<=28?28:36)+(weekToday()>28?' (mở rộng)':'')+' · '+D.phaseOf(weekToday()).name+'</div><button class="btn primary" data-nav="training" style="justify-self:start">Mở chi tiết buổi tập →</button></div><div class="card mint stack"><div class="micro">DAILY ROUTINE</div><h2>Ăn uống quanh giờ tập</h2><div class="timeline">'+[['13:30','Bữa chính','Protein + tinh bột + rau'],['17:00','Bữa phụ','Protein và trái cây'],['18:45','Trước tập','Snack nếu đói'],['21:00','Sau tập','Protein + carb + rau']].map(x=>'<div class="timelineitem"><div class="time">'+x[0]+'</div><div><b>'+x[1]+'</b><p>'+x[2]+'</p></div></div>').join('')+'</div><button class="btn" data-nav="nutrition">Xem kế hoạch dinh dưỡng →</button></div></div><div class="grid g2"><div class="card stack"><div class="paneltitle"><h3>Daily check-in</h3><span class="pill lav">Phục hồi trước khi tăng tải</span></div><form id="check-form" class="formgrid"><div class="formitem"><label>Ngày</label><input class="field" name="date" type="date" required value="'+dateNow()+'"></div><div class="formitem"><label>Đau cơ</label><select class="field" name="pain"><option value="0">Không đau</option><option value="1">Chỉ đau khi ấn vào</option><option value="2">Đau rõ khi vận động</option><option value="3">Đau nhiều / bất thường</option></select></div><div class="formitem"><label>Năng lượng</label><select class="field" name="energy"><option value="good">Tốt</option><option value="normal" selected>Bình thường</option><option value="low">Thấp</option></select></div><div class="formitem"><label>Ngủ (giờ)</label><input class="field" name="sleep" type="number" step=".25" min="0" max="16" placeholder="7.5"></div><div class="formitem" style="grid-column:span 2"><label>Ghi chú (không bắt buộc)</label><input class="field" name="note" maxlength="250" placeholder="Ví dụ: chân đỡ đau, ngồi xuống bình thường"></div><button type="submit" class="btn primary">Lưu check-in</button></form><div class="notice '+(lastCheck?.pain>=2?'amber':'green')+'">'+checkMsg+'</div></div><div class="card stack"><div class="paneltitle"><h3>Nhịp theo dõi cơ thể</h3><button class="btn small" data-nav="goals">Xem biểu đồ →</button></div><div class="checklist"><div class="item"><span>Cân buổi sáng</span><b>2–7 lần/tuần</b></div><div class="item"><span>Eo/rốn/mông/đùi/tay</span><b>Mỗi 2 tuần</b></div><div class="item"><span>InBody cùng điều kiện đo</span><b>Khoảng 4–6 tuần</b></div><div class="item"><span>Kế hoạch tập & phục hồi</span><b>Cuối mỗi tuần</b></div></div><p class="notice">Số đo cơ thể cũ (eo 67, rốn 72, mông 96, đùi 56, tay 28 cm) được giữ dưới dạng tham chiếu, không coi là số đo hiện tại tháng 10.</p></div></div></div>'
}
function trainingKey(week,day,date){return [date,'P2',week,day].join('|')}
function actualExercise(week,day,index,originalId){const id=state.overrides[['P2',week,day,index].join('|')];return id&&D.EXERCISES[id]?id:originalId}
function sessionLog(){return state.workouts[trainingKey(selectedWeek,selectedDay,trainingDate)]||{}}
function previousPerformance(id){
let records=[];
for(const [key,log] of Object.entries(state.workouts)){
if(!log||typeof log!=='object')continue;
for(const [x,item] of Object.entries(log)){
if(x===id&&Array.isArray(item))for(const set of item){if(set.done&&Number.isFinite(+set.kg)&&set.kg!=='')records.push({date:key.split('|')[0],kg:+set.kg,reps:+set.reps||0})}
}
}
records.sort((a,b)=>a.date.localeCompare(b.date));
return records.at(-1)||null;
}
/* Simple double-progression guidance from recorded working sets.
   Keep user judgment: no automatic load increase and never infer technique or joint pain. */
function progressionAdvice(id,e){
 const upperMatch=String(e.range||"").match(/^(\d+)\s*[–-]\s*(\d+)/);
 if(!upperMatch)return "Giữ mức tập an toàn, tập đều và ưu tiên kỹ thuật.";
 const upper=Number(upperMatch[2]);
 const records=Object.entries(state.workouts)
  .filter(([,sess])=>sess&&Array.isArray(sess[id]))
  .sort((a,b)=>b[0].localeCompare(a[0]));
 if(!records.length)return "Chưa có set hoàn thành: chọn tạ nhẹ, tập đúng kỹ thuật và ghi RIR.";
 const completed=records[0][1][id].filter(x=>x?.done&&x.reps!=null);
 if(completed.length<2)return "Cần ít nhất 2 set hoàn thành để đánh giá khả năng tăng tạ.";
 if(completed.every(x=>Number(x.reps)>=upper&&x.rir!=null&&Number(x.rir)>=2)){
  return id==="assisted-pullup"
   ?"Log đã đạt giới hạn reps với RIR ≥2. Nếu kỹ thuật tốt và không đau, có thể thử GIẢM một nấc trợ lực ở lần sau."
   :"Log đã đạt giới hạn reps với RIR ≥2. Nếu kỹ thuật tốt và không đau, có thể thử TĂNG một nấc tạ nhỏ ở lần sau.";
 }
 return "Giữ mức tạ/trợ lực, tăng reps dần trước. Chỉ tăng tải khi mọi set đủ reps, RIR ≥2 và không đau.";
}
function renderTraining(){
const w=activeWorkout(),p=D.phaseOf(selectedWeek),cfg=D.weekOf(selectedWeek),detail=cfg.focus,log=sessionLog();
let progress=0,total=0;
for(const [i,b] of w.exercises.entries()){
 const id=actualExercise(selectedWeek,selectedDay,i,b.id),sets=log[id]||[];
 total+=b.sets;progress+=sets.slice(0,b.sets).filter(x=>x?.done).length;
}
const maxWeeks=D.MAX_WEEKS||36;
const weekButtons=Array.from({length:maxWeeks},(_,i)=>{
 const n=i+1,x=D.weekOf(n);
 return '<button class="weekbtn '+(n===selectedWeek?'active':'')+' '+(n===weekToday()?'aria-current="date"':'')+' data-week="'+n+'">W'+n+'<small>'+(n===weekToday()?'Tuần này':n>28?'Mở rộng':x.deload?'Giảm tải':x.checkpoint?'Đánh giá':'')+'</small></button>';
}).join('');
const phaseButtons=D.PHASES.map(x=>'<button type="button" class="phasecard '+(selectedWeek>=x.start&&selectedWeek<=x.end?'active':'')+'" data-week="'+x.start+'"><small>W'+x.start+'–'+x.end+'</small><b>'+escape(x.name.replace('Giai đoạn ','').replace(' · ',': '))+'</b></button>').join('');
const checkpoint=cfg.checkpoint?'<span class="pill mint">Tuần đo số đo / đánh giá</span>':'';
return '<div class="stack">'+
 heading('GLUTES · PULL · GLUTES · PUSH','Giáo án 28 tuần + 8 tuần tùy chọn','4 ngày × 6 bài, mỗi buổi một chuỗi cơ rõ ràng. Không xoay hàng loạt bài theo phase; tiến bộ bằng reps, tạ và khối lượng tập phù hợp.')+
 card('Chọn tuần & giai đoạn','<div class="phasegrid">'+phaseButtons+'</div>'+
 '<div class="spaceline"></div><div class="weekscroller" aria-label="Chọn tuần 1 đến 36">'+weekButtons+'</div>'+
 '<div class="grid g3">'+
 '<div class="tile"><div class="micro">'+(cfg.extended?'TUẦN MỞ RỘNG':'LỘ TRÌNH CHÍNH')+' · W'+selectedWeek+'/'+maxWeeks+'</div><h3>'+escape(p.short)+'</h3><p>Bắt đầu '+weekStartNumber(selectedWeek)+(cfg.extended?' · Chỉ áp dụng nếu cần':'')+'</p></div>'+
 '<div class="tile"><div class="micro">MỤC TIÊU TUẦN</div><h3>'+escape(detail)+'</h3><p>'+escape(cfg.action)+'</p></div>'+
 '<div class="tile"><div class="micro">KHỐI LƯỢNG TẬP</div><h3>'+escape(cfg.setDescription)+'</h3><p>RIR '+escape(cfg.rir)+' · 6 bài/buổi; bài cuối tùy thời gian</p></div>'+
 '</div><div class="tags" style="margin-top:10px">'+checkpoint+(cfg.deload?'<span class="pill warn">Giảm tải theo mức hồi phục</span>':'')+
 (cfg.extended?'<span class="pill warn">Không phải hạn phải đạt 55 kg</span>':'')+
 '</div><div class="notice" style="margin-top:12px"><b>Cách tiến bộ:</b> đủ reps ở tất cả set, kỹ thuật tốt, còn khoảng 2 reps dự phòng và không đau khớp → cân nhắc tăng tạ một nấc nhỏ. Nếu chưa đủ reps → giữ tạ, tăng reps dần. Tuần giảm tải ưu tiên hồi phục; không cần thay bài.</div>')+
 card('Buổi tập trong tuần','<div class="daygrid">'+D.BASE.map((x,i)=>'<button class="daycard '+(selectedDay===i?'active':'')+'" data-day="'+i+'"><b>'+x.label+' · '+x.code+'</b><small>'+x.title+'</small></button>').join('')+'</div><div class="spaceline"></div><div class="grid g2"><div><div class="micro">'+escape(w.code)+' · '+escape(w.phase.short)+'</div><h2>'+escape(w.title)+'</h2><p class="quiet">'+escape(w.intro)+'</p></div><div class="tile"><div class="micro">Tiến độ ghi nhận</div><div class="statnum" id="session-count">'+progress+'/'+total+' <small>set</small></div><div class="bar"><span id="session-bar" style="width:'+(total?100*progress/total:0)+'%"></span></div></div></div><div class="spacer"></div><div class="formgrid"><div class="formitem"><label for="training-date">Ngày ghi nhật ký</label><input id="training-date" class="field" type="date" value="'+trainingDate+'"></div><div class="formitem"><label>Thời gian tập</label><input class="field" value="'+escape(state.profile.workoutTime)+'" disabled></div><div class="formitem"><label>Số bài tập</label><input class="field" value="'+w.exercises.length+' bài · khoảng 45 phút" disabled></div></div><p class="meta" style="margin:10px 0 13px">Nhật ký chương trình mới lưu tách với giáo án cũ theo <b>ngày + tuần + buổi</b>. Lịch sử cũ vẫn còn và dùng tham khảo tạ; ứng dụng không tự tăng tạ thay bạn. <button class="btn small" type="button" data-help-rir>RIR là gì? →</button></p><div class="stack">'+w.exercises.map((b,i)=>{
const id=actualExercise(selectedWeek,selectedDay,i,b.id),e=D.EXERCISES[id],last=previousPerformance(id),setlog=log[id]||[];
const doneCount=setlog.slice(0,b.sets).filter(x=>x?.done).length;
const dot=Array.from({length:b.sets},(_,j)=>{
const x=setlog[j]||{};
return '<div class="compact-set-row" role="group" aria-label="Set '+(j+1)+' · '+escape(e.name)+'">'+
'<span class="set-index" title="Set '+(j+1)+'">S'+(j+1)+'</span>'+
'<input class="setinput compact-field weight-field" aria-label="'+(id==='assisted-pullup'?'Trợ lực':'Tạ')+' (kg), set '+(j+1)+' · '+escape(e.name)+'" inputmode="decimal" type="number" step=".5" min="0" max="400" data-setinput="'+i+'|'+j+'|kg" value="'+escape(x.kg??'')+'" placeholder="kg">'+
'<span class="set-times" aria-hidden="true">×</span>'+
'<input class="setinput compact-field rep-field" aria-label="Số lần, set '+(j+1)+' · '+escape(e.name)+'" type="number" min="0" max="100" data-setinput="'+i+'|'+j+'|reps" value="'+escape(x.reps??'')+'" placeholder="reps">'+
'<input class="setinput compact-field rir-field" aria-label="RIR, set '+(j+1)+' · '+escape(e.name)+'" type="number" min="0" max="10" data-setinput="'+i+'|'+j+'|rir" value="'+escape(x.rir??'')+'" placeholder="RIR">'+
'<label class="compact-done" title="Đánh dấu hoàn thành set '+(j+1)+'"><input type="checkbox" aria-label="Hoàn thành set '+(j+1)+' · '+escape(e.name)+'" data-setinput="'+i+'|'+j+'|done" '+(x.done?'checked':'')+'><span aria-hidden="true">✓</span></label></div>';
}).join('');
return '<article class="exrow"><div class="exnum">'+(i+1)+'</div><div><div class="exhead"><div><h3>'+escape(e.name)+'</h3><div class="meta">'+escape(e.vn)+' · '+b.sets+' set × '+escape(b.reps)+' · nghỉ '+e.rest+' giây · RIR '+escape(w.week.rir)+(b.optional?' · bài bổ trợ tùy chọn':'')+'</div></div><button class="btn small" data-ex-open="'+id+'">Hướng dẫn ↗</button></div><div class="tags"><span class="pill rose">Chính: '+escape(e.primary)+'</span>'+e.secondary.slice(0,2).map(x=>'<span class="pill lav">Phụ: '+escape(x)+'</span>').join('')+'</div><div class="meta">Mục tiêu: '+escape(e.why)+'</div><div class="exactions"><span class="pill mint">'+(id==='assisted-pullup'?'Trợ lực gần nhất: ':'Tạ gần nhất: ')+(last?num(last.kg)+' kg × '+last.reps:'Chưa có log')+'</span></div><details class="quick-guide"><summary>▾ Xem nhanh: động tác · hít thở · lưu ý</summary><div class="guide-content"><div class="guide-line"><b>Gợi ý mức tạ:</b> '+escape(e.load)+'</div><div class="guide-line"><b>Gợi ý tăng tiến từ nhật ký:</b> '+escape(progressionAdvice(id,e))+'</div><div class="guide-line"><b>Chuẩn bị:</b> '+escape(e.setup)+'</div><ol>'+e.steps.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ol><div class="guide-line"><b>Hít thở:</b> '+escape(e.breath)+'</div><div class="guide-line"><b>Cảm nhận đúng:</b> '+escape(e.cues)+'</div><div class="guide-warning"><b>Tránh:</b> '+escape(e.errors)+'</div><div class="actions"><button class="btn small" data-ex-open="'+id+'">Đánh giá nhóm cơ & bài thay thế →</button></div></div></details></div><div class="exbody"><details class="setlog"><summary><span class="setlog-title">✎ Ghi set</span><span class="setlog-status" data-ex-count="'+i+'">'+doneCount+'/'+b.sets+' hoàn thành</span><span class="setlog-chevron" aria-hidden="true">⌄</span></summary><div class="setlog-content"><div class="compact-set-list">'+dot+'</div><p class="setlog-note">Tạ (kg) × số lần · RIR tùy chọn · ✓ đánh dấu hoàn thành và bắt đầu giờ nghỉ.</p></div></details></div></article>'
}).join('')+'</div><div class="notice green" style="margin-top:13px"><b>Cardio sau tập:</b> '+escape(w.cardio)+'; mức dốc 8%, 5 km/h không phải yêu cầu bắt buộc. Nếu chân đau khiến đi sai tư thế, giảm dốc hoặc bỏ cardio.</div><div class="footerbuttons"><button class="btn" data-workout-review>Nhìn lại hiệu quả tuần</button><button class="btn primary" data-session-summary>Xem tổng kết buổi tập →</button></div>')+
'<div class="grid g2">'+card('Nhóm cơ được ưu tiên trong buổi',muscleDistribution(w))+
card('Tiến độ toàn chương trình','<div class="checklist">'+D.PHASES.map(x=>'<div class="item"><b>W'+x.start+'–'+x.end+' · '+escape(x.short)+'</b><span>'+escape(x.sets)+'</span></div>').join('')+'</div><p class="notice amber" style="margin-top:12px">28 tuần là kỳ đánh giá, 29–36 là thời gian mở rộng tùy chọn. Cân nặng và số đo thực tế quyết định có tiếp tục giảm hay chuyển sang duy trì.</p>')+'</div></div>'
}
function muscleDistribution(w){
const m={};for(const [i,b] of w.exercises.entries()){let id=actualExercise(selectedWeek,selectedDay,i,b.id),e=D.EXERCISES[id];m[e.primary]=(m[e.primary]||0)+b.sets}
let data=Object.entries(m).sort((a,b)=>b[1]-a[1]);let max=Math.max(1,...data.map(x=>x[1]));
return data.map(([k,v])=>'<div class="barline"><span>'+escape(k)+'</span><div class="track"><span style="width:'+(100*v/max)+'%"></span></div><strong>'+v+'</strong></div>').join('')+'<p class="meta">Chỉ tính set nhóm cơ chính; nhóm cơ phụ vẫn được kích hoạt nhưng không cộng trùng toàn bộ set.</p>'
}
function renderLibrary(){
let es=Object.entries(D.EXERCISES).filter(([id,e])=>(!detailMuscle||e.primary===detailMuscle||e.secondary.includes(detailMuscle))&&(!detailFilter||(e.name+' '+e.vn+' '+e.primary+' '+e.secondary.join(' ')).toLowerCase().includes(detailFilter.toLowerCase())));
let groups=[...new Set(Object.values(D.EXERCISES).map(x=>x.primary))].sort();
return '<div class="stack">'+heading('MOVEMENT LIBRARY','Thư viện bài tập & nhóm cơ','Chọn từng động tác để xem kỹ thuật, hít thở, cảnh báo, tác động cơ và cách chọn/tăng tạ.')+
card('Tìm bài và nhóm cơ','<div class="filterrow"><input id="library-search" class="field" type="search" placeholder="Tên bài, cơ mông, cơ xô, lưng..." value="'+escape(detailFilter)+'"><select id="library-group" class="field" style="max-width:245px"><option value="">Tất cả nhóm cơ</option>'+groups.map(x=>'<option '+(detailMuscle===x?'selected':'')+'>'+escape(x)+'</option>').join('')+'</select></div><p class="meta" style="margin-top:10px">Có '+es.length+' bài phù hợp · thông tin tác động là mức nhấn mạnh tương đối để lập kế hoạch, không phải dữ liệu đo cơ sinh học.</p>')+
'<div class="grid g3">'+es.map(([id,e])=>'<div class="tile stack"><div class="micro">'+escape(e.kind)+'</div><h3>'+escape(e.name)+'</h3><p>'+escape(e.vn)+'</p><div class="tags"><span class="pill rose">'+escape(e.primary)+'</span><span class="pill lav">'+escape(e.secondary[0]||'Ổn định')+'</span></div><p>'+escape(e.why)+'</p><button class="btn full" data-ex-open="'+id+'">Xem chi tiết kỹ thuật →</button></div>').join('')+'</div></div>'
}
function latestStats(){
const a=measures(),last=a.at(-1);let first=a[0];
return {last,first};
}
function measuresChart(entries,key='weight'){
const pts=entries.filter(x=>Number.isFinite(+x[key])).map(x=>({date:x.date,value:+x[key]}));
if(pts.length<2)return '<div class="empty">Cần ít nhất hai lần đo '+(key==='weight'?'cân nặng':'chỉ số')+' để biểu đồ có ý nghĩa. Số liệu gốc vẫn được giữ.</div>';
const vals=pts.map(x=>x.value), lo=Math.min(...vals,key==='weight'?state.profile.target:Infinity),hi=Math.max(...vals),ymin=lo-Math.max(.5,(hi-lo)*.15),ymax=hi+Math.max(.5,(hi-lo)*.15),xmin=dayInLocal(pts[0].date).getTime(),xmax=dayInLocal(pts.at(-1).date).getTime(),width=700,height=235,x=t=>40+620*(t-xmin)/Math.max(86400000,xmax-xmin),y=v=>205-(v-ymin)/Math.max(.001,ymax-ymin)*178;
const path=pts.map((p,i)=>(i?'L':'M')+x(dayInLocal(p.date).getTime()).toFixed(1)+','+y(p.value).toFixed(1)).join(' ');
let goal=key==='weight'?'<line class="goalline" x1="40" y1="'+y(state.profile.target)+'" x2="660" y2="'+y(state.profile.target)+'"></line><text x="46" y="'+(y(state.profile.target)-6)+'">Đích '+state.profile.target+' kg</text>':'';
return '<svg class="chart" viewBox="0 0 700 235" role="img" aria-label="Đồ thị '+escape(key)+' theo thời gian">'+Array.from({length:4},(_,i)=>{let val=ymin+(ymax-ymin)*i/3,Y=y(val);return '<line class="gridline" x1="40" x2="660" y1="'+Y+'" y2="'+Y+'"></line><text x="2" y="'+(Y+3)+'">'+num(val,1)+'</text>'}).join('')+goal+'<path class="actual" d="'+path+'"></path>'+pts.map(p=>'<circle class="point" cx="'+x(dayInLocal(p.date).getTime())+'" cy="'+y(p.value)+'" r="4.3"></circle>').join('')+'<text x="40" y="228">'+escape(pts[0].date)+'</text><text x="660" y="228" text-anchor="end">'+escape(pts.at(-1).date)+'</text></svg>'
}
function renderGoals(){
const m=measures(),l=latest('weight'),lastS={};for(const f of D.MEASURE_FIELDS)lastS[f.key]=latest(f.key);
const goalCards=D.MEASURE_FIELDS.map(f=>{
const x=lastS[f.key],t=state.profile.goals[f.key];return '<div class="measuremini"><span>'+f.label+'</span><b>'+(x?num(x[f.key])+' '+f.unit:'Chưa đo')+'</b><small>'+(x?'Ngày '+escape(x.date):(f.old==null?'Chưa có số đo cũ':'Tham chiếu cũ: '+f.old+' '+f.unit))+'</small>'+(t?'<div class="meta" style="margin-top:5px">Mong muốn: '+num(t)+' '+f.unit+'</div>':'')+'</div>'}).join('');
let first= m[0],last=m.at(-1),len=m.length;
let insight=len<3?'Chưa đủ số lần đo để phân tích xu hướng. Hãy nhập đều và so sánh trung bình nhiều ngày.':Number(last.weight)<Number(first.weight)?'Cân gần nhất thấp hơn lần gốc. Kiểm tra thêm vòng eo, sức tập và thời điểm chu kỳ kinh để đánh giá giảm mỡ.':'Cân gần nhất chưa thấp hơn lần gốc. Không nên kết luận tăng mỡ nếu dữ liệu chỉ có vài lần đo hoặc thay đổi nước.';
return '<div class="stack">'+heading('BODY GOALS · 55 KG','Mục tiêu cân nặng & số đo','Một nơi để đặt mục tiêu, xem cơ thể thay đổi và ghi nhận InBody. Các vòng đo cũ không được coi là vòng đo hiện tại.')+
'<div class="grid g4">'+[['Cân mới nhất',num(latestWeight(),2)+' kg','Mốc gốc 63.3 kg'],['Mục tiêu',num(state.profile.target)+' kg','Có thể chỉnh, đánh giá lại ở 58 kg'],['Mỡ InBody',num(latest('fat')?.fat)+' kg','Ngày '+escape(latest('fat')?.date||'—')],['Cơ xương',num(latest('muscle')?.muscle)+' kg','Ngày '+escape(latest('muscle')?.date||'—')]].map(x=>'<div class="card stat"><div class="statlabel">'+x[0]+'</div><div class="statnum">'+x[1]+'</div><div class="meta">'+x[2]+'</div></div>').join('')+'</div>'+
'<div class="grid g2">'+card('Cân nặng & xu hướng','<div class="actions" style="margin-bottom:9px">'+[['weight','Cân'],['waist','Eo'],['navel','Ngang rốn'],['hip','Mông'],['chest','Ngực'],['underbust','Chân ngực']].map(x=>'<button class="subtab '+(chartMeasure===x[0]?'active':'')+'" data-chart="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+measuresChart(m,chartMeasure)+'<p class="meta">Theo dõi cân trung bình 7 ngày để giảm ảnh hưởng của nước, glycogen và chu kỳ. Khi chưa đủ dữ liệu, app không tự dự báo mức giảm.</p>')+
card('Mốc hành trình','<div class="checklist">'+[61,59,58,55].map((x,i)=>'<div class="item"><span><b>'+x+' kg</b> · '+['Thói quen','Giảm mỡ ổn định','Checkpoint hình thể','Mốc đích tự chọn'][i]+'</span><span class="pill '+(latestWeight()<=x?'mint':'')+'">'+(latestWeight()<=x?'Đã chạm':'Còn '+num(Math.max(0,latestWeight()-x),2)+' kg')+'</span></div>').join('')+'</div><div class="notice amber" style="margin-top:14px">Mốc 55 kg là mong muốn, không phải bắt buộc. Tại 58 kg, đánh giá lại cảm giác khỏe, sức mạnh, số đo và chu kỳ trước khi tiếp tục.</div>')+'</div>'+
card('Số đo hình thể','<div class="metricgrid">'+goalCards+'</div><p class="meta" style="margin-top:11px">Số đo tham chiếu cũ: eo 67 · rốn 72 · mông 96 · đùi 56 · bắp tay 28 · bắp chân 35 cm. Chúng không cùng ngày đo 16/10.</p><div class="actions" style="margin-top:13px"><button class="btn primary" data-open-measure>+ Nhập số đo mới</button><button class="btn" data-open-goal>Thiết lập mục tiêu từng vòng đo</button><label class="btn" for="measurement-import">↑ Nhập bộ số đo JSON</label><input id="measurement-import" type="file" accept=".json,application/json" style="position:absolute;left:-10000px;width:1px;height:1px" aria-label="Nhập bộ số đo từ tệp JSON"></div>')+
'<div class="grid g2">'+card('Body insights','<p class="quiet">'+escape(insight)+'</p><div class="spacer"></div><div class="notice"><b>InBody cần thận trọng:</b> khi lượng nước, thời gian đo hoặc buổi tập trước đó thay đổi, ước tính cơ và mỡ cũng có thể thay đổi. Không coi SMM tăng/giảm nhỏ là kết luận chắc chắn.</div>')+
card('Cách đo để so sánh được','<div class="checklist"><div class="item">Cân buổi sáng, sau vệ sinh <span>2–7 lần/tuần</span></div><div class="item">Đo eo, bụng, mông, tay, đùi <span>2 tuần/lần</span></div><div class="item">Đo cùng thước, cùng vị trí <span>Không siết thước</span></div><div class="item">InBody trong điều kiện tương tự <span>4–6 tuần/lần</span></div></div><p class="notice" style="margin-top:12px">Lưu ngày đo, tình trạng chu kỳ kinh và cảm giác giữ nước để dễ so sánh.</p>')+'</div>'+
card('Lịch sử chỉ số','<div class="tablewrap"><table class="table"><thead><tr><th>Ngày</th><th>Cân (kg)</th><th>Eo / Rốn (cm)</th><th>Mông / Đùi (cm)</th><th>Ngực / Chân ngực (cm)</th><th>Mỡ (kg)</th><th>SMM (kg)</th><th>Thao tác</th></tr></thead><tbody>'+m.slice().reverse().map(x=>'<tr><td>'+escape(x.date)+(x.date===BASE.date?' · Gốc':'')+'</td><td>'+num(x.weight,2)+'</td><td>'+num(x.waist)+' / '+num(x.navel)+'</td><td>'+num(x.hip)+' / '+num(x.thigh)+'</td><td>'+num(x.chest)+' / '+num(x.underbust)+'</td><td>'+num(x.fat)+'</td><td>'+num(x.muscle)+'</td><td>'+(x.date===BASE.date?'—':'<button class="btn small" data-edit-measure="'+escape(x.date)+'">Sửa</button>')+'</td></tr>').join('')+'</tbody></table></div>')+'</div>'
}
function measurementForm(exist){
const x=exist||{},a=[['weight','Cân nặng (kg)',30,150],['waist','Eo (cm)',35,150],['navel','Bụng ngang rốn (cm)',35,180],['hip','Mông (cm)',45,180],['thigh','Đùi (cm)',20,100],['arm','Bắp tay (cm)',10,70],['calf','Bắp chân (cm)',15,80],['chest','Ngực (cm)',40,150],['underbust','Chân ngực (cm)',35,150],['fat','Khối lượng mỡ (kg)',0,80],['muscle','Cơ xương SMM (kg)',0,65],['pbf','Tỷ lệ mỡ PBF (%)',0,70],['water','Nước cơ thể (L)',0,80]];
return '<form id="measure-form" class="stack"><div class="notice">Ưu tiên số đo cùng thời điểm, không cần điền hết mỗi lần. Ngày gốc InBody 16/10 được giữ nguyên.</div><div class="formgrid"><div class="formitem"><label>Ngày đo</label><input name="date" type="date" class="field" value="'+escape(x.date||dateNow())+'" required></div>'+a.map(k=>'<div class="formitem"><label>'+k[1]+'</label><input class="field" name="'+k[0]+'" type="number" step=".1" min="'+k[2]+'" max="'+k[3]+'" value="'+escape(x[k[0]]??'')+'"></div>').join('')+'<div class="formitem"><label>Tình trạng chu kỳ / giữ nước (tùy chọn)</label><input class="field" maxlength="110" name="cycle" value="'+escape(x.cycle||'')+'" placeholder="Ví dụ: gần kỳ kinh"></div></div><div class="actions"><button class="btn primary" type="submit">Lưu số đo</button><button class="btn" type="button" data-close-modal>Hủy</button></div></form>'
}
function goalForm(){
const g=state.profile.goals;
return '<form id="goal-form" class="stack"><div class="notice">Các mục tiêu vòng đo là lựa chọn cá nhân; để trống nếu chưa chắc chắn. Không có công thức chính xác suy ra vòng eo, đùi hay mông từ cân 55 kg.</div><div class="formgrid">'+shortInput('Cân nặng đích (kg)','goal-weight',state.profile.target,40,80)+D.MEASURE_FIELDS.map(f=>shortInput(f.label+' (cm)','goal-'+f.key,g[f.key]??'',20,170,'.1')).join('')+'</div><div class="actions"><button class="btn primary" type="submit">Lưu mục tiêu</button><button class="btn" type="button" data-close-modal>Hủy</button></div></form>'
}
function nutritionTotals(day){
const entries=state.meals.filter(x=>x.date===day);
return {kcal:entries.reduce((n,x)=>n+(+x.kcal||0),0),protein:entries.reduce((n,x)=>n+(+x.protein||0),0),carb:entries.reduce((n,x)=>n+(+x.carb||0),0),fat:entries.reduce((n,x)=>n+(+x.fat||0),0)};
}
function nutritionSchedule(){
let routine=nutritionMode==='training'?
[[state.profile.firstMeal,'Bữa chính 1','Cơm + cá/tôm/bò + rau. Khoảng 35 g protein.'],['17:00','Bữa phụ','Sữa chua Hy Lạp / nguồn đạm + trái cây.'],['18:45','Snack trước tập nếu đói','Chuối hoặc phần tinh bột dễ tiêu, đừng ép ăn nếu không đói.'],[state.profile.workoutTime,'Tập tạ','45 phút tập tạ, cardio theo buổi.'],['21:00','Bữa sau tập','Protein + cơm/khoai + rau; ưu tiên đủ đạm cả ngày.'],[state.profile.sleepTime,'Đi ngủ','Hướng tới 7–9 giờ, điều chỉnh nếu tập muộn gây khó ngủ.']]:
[[state.profile.firstMeal,'Bữa chính 1','Protein + rau + tinh bột vừa đủ.'],['16:30','Bữa phụ','Sữa chua/trái cây + nguồn đạm.'],['19:00','Đi bộ tùy chọn','Đi bộ nhẹ, không bắt buộc độ dốc cao.'],['20:15','Bữa tối','Không nhịn bù vì nghỉ gym.'],[state.profile.sleepTime,'Chuẩn bị ngủ','Giữ giờ ngủ ổn định.']];
return '<div class="timeline">'+routine.map(x=>'<div class="timelineitem"><span class="time">'+escape(x[0])+'</span><div><b>'+escape(x[1])+'</b><p>'+escape(x[2])+'</p></div></div>').join('')+'</div>'
}
function renderNutrition(){
const total=nutritionTotals(nutritionDate);
const f=state.profile;
const currentEntries=state.meals.filter(x=>x.date===nutritionDate);
const legacy=(state.archive.meals||[]).filter(x=>x.date===nutritionDate);
return '<div class="stack">'+heading('NUTRITION & DAILY RHYTHM','Dinh dưỡng, giờ ăn và phục hồi','Liên kết khung giờ ăn với lịch tập 19:30. Số kcal và macro là mức thử, cần điều chỉnh dựa trên xu hướng thực tế.')+
'<div class="grid g4">'+[['Kcal mục tiêu',money(f.calories),'kcal/ngày'],['Protein',money(f.protein)+' g','Ưu tiên giữ cơ'],['Carb',money(f.carb)+' g','Năng lượng cho tập'],['Chất béo',money(f.fat)+' g','Đủ cho bữa ăn']].map(x=>'<div class="card stat"><div class="statlabel">'+x[0]+'</div><div class="statnum">'+x[1]+'</div><p class="meta">'+x[2]+'</p></div>').join('')+'</div>'+
'<div class="grid g2">'+card('Thời gian biểu','<div class="tabrow" style="margin-bottom:15px"><button class="subtab '+(nutritionMode==='training'?'active':'')+'" data-mode="training">Ngày gym</button><button class="subtab '+(nutritionMode==='rest'?'active':'')+'" data-mode="rest">Ngày nghỉ</button></div>'+nutritionSchedule()+'<div class="notice" style="margin-top:14px">IF 16:8 là tùy chọn. Khung '+escape(f.firstMeal)+'–'+escape(f.lastMeal)+' có thể thay đổi; không nên cố nhịn sau buổi tập nếu cần bổ sung dinh dưỡng.</div>')+
card('Thiết lập dinh dưỡng & giờ tập','<form id="nutrition-settings" class="stack"><div class="formgrid">'+[
['calories','Kcal mục tiêu',f.calories,'number'],['protein','Protein (g)',f.protein,'number'],['carb','Carb (g)',f.carb,'number'],['fat','Chất béo (g)',f.fat,'number'],['workoutTime','Giờ tập',f.workoutTime,'time'],['sleepTime','Giờ ngủ',f.sleepTime,'time'],['firstMeal','Bữa đầu',f.firstMeal,'time'],['lastMeal','Bữa cuối',f.lastMeal,'time']
].map(x=>'<div class="formitem"><label>'+x[1]+'</label><input class="field" name="'+x[0]+'" type="'+x[3]+'" '+(x[3]==='number'?'min="0" step="1"':'')+' value="'+escape(x[2])+'" required></div>').join('')+'</div><div class="notice">Macro chuẩn ví dụ 110g protein + 190g carb + 55g fat = 1.695 kcal. Nếu thay đổi macro, kiểm tra năng lượng tổng. Không tự hạ calories sâu chỉ vì cân tăng vài ngày.</div><button class="btn primary" type="submit">Lưu thiết lập</button></form>')+'</div>'+
card('Food Journal · nhật ký món ăn','<div class="grid g2"><div class="formitem"><label>Chọn ngày xem nhật ký</label><input class="field" type="date" id="nutrition-date" value="'+nutritionDate+'"></div><div class="tile"><div class="micro">Đã ghi trong ngày</div><h3>'+money(total.kcal)+' / '+money(f.calories)+' kcal</h3><div class="nutritionmeter"><div style="width:'+Math.min(100,100*total.kcal/Math.max(1,f.calories))+'%"></div></div><p>Protein '+num(total.protein)+' / '+f.protein+' g · Carb '+num(total.carb)+' g · Fat '+num(total.fat)+' g</p></div></div><div class="spacer"></div><form id="meal-form" class="formgrid"><div class="formitem"><label>Thực phẩm</label><select class="field" name="food" id="meal-food"><option value="custom">Món tự nhập / bánh ngọt</option>'+D.FOODS.map(x=>'<option value="'+x.id+'">'+escape(x.name)+'</option>').join('')+'</select></div><div class="formitem"><label>Khối lượng (g)</label><input class="field" name="grams" type="number" min="1" max="2500" value="100" required></div><div class="formitem"><label>Bữa</label><select class="field" name="meal"><option>Bữa chính</option><option>Bữa phụ</option><option>Trước tập</option><option>Sau tập</option><option>Ăn ngoài / bánh</option></select></div><div class="formitem"><label>Kcal (món tự nhập)</label><input class="field" name="kcal" type="number" min="0" max="5000" value="0"></div><div class="formitem"><label>Protein g (món tự nhập)</label><input class="field" name="protein" type="number" step=".1" min="0" max="400" value="0"></div><div class="formitem"><label>Ghi chú</label><input class="field" name="note" maxlength="130" placeholder="Ví dụ: cá bớp nướng"></div><button class="btn primary" type="submit">+ Ghi bữa ăn</button></form><p class="meta" style="margin-top:10px">Giá trị thực phẩm chỉ là ước lượng trên 100g; chú ý phần ăn được, thực phẩm sống/chín và dầu/sốt. Với món phức tạp hãy tự nhập kcal/đạm theo khẩu phần thực tế.</p><div class="spacer"></div><div class="checklist">'+(currentEntries.length?currentEntries.map(x=>'<div class="item"><span><b>'+escape(x.name)+'</b> · '+escape(x.meal)+'<br><span class="meta">'+num(x.grams,0)+' g · '+num(x.protein)+'g protein</span></span><span>'+money(x.kcal)+' kcal <button class="btn small" data-del-meal="'+escape(x.id)+'">Xóa</button></span></div>').join(''):'<div class="empty">Chưa ghi bữa ăn cho ngày đã chọn.</div>')+'</div>'+(legacy.length?'<div class="notice amber" style="margin-top:12px">Bản cũ có '+legacy.length+' ghi nhận tổng ngày cho ngày này; được giữ trong sao lưu, không cộng trùng vào nhật ký món của bản mới.</div>':'') )+
'<div class="notice green">Theo dõi dinh dưỡng nên linh hoạt: vẫn ghi nhận bánh ngọt/bữa ăn ngoài, không yêu cầu nhịn bù hoặc cardio bù. Nếu đói kéo dài, mệt nhiều, rối loạn chu kỳ hoặc sức tập giảm, cần đánh giá lại mức năng lượng.</div></div>'
}
function dataModal(){
let legacyW=Object.keys(state.archive.workouts||{}).length;
modal('Sao lưu, khôi phục & dữ liệu','<div class="stack"><div class="notice">FIT55 lưu dữ liệu trên trình duyệt bằng localStorage. GitHub Pages không đồng bộ giữa điện thoại và máy tính. Xuất bản sao lưu JSON định kỳ trước khi đổi thiết bị hoặc xóa dữ liệu trình duyệt.</div><div class="grid g2"><div class="tile"><div class="micro">Nhật ký mới</div><h3>'+Object.keys(state.workouts).length+' buổi</h3><p>Dữ liệu FIT55 v4</p></div><div class="tile"><div class="micro">Dữ liệu cũ đã nhận diện</div><h3>'+legacyW+' buổi</h3><p>Lưu riêng, không ghi đè nhật ký mới</p></div></div><div class="actions"><button class="btn primary" data-export>Tải bản sao lưu JSON</button><label class="btn" for="data-import">Nhập JSON</label><input id="data-import" style="position:absolute;left:-10000px" type="file" accept=".json,application/json"></div><div class="notice amber">Nhập file sẽ thay thế nhật ký v4 hiện tại sau khi xác nhận. Hãy xuất bản sao lưu trước.</div><div class="actions"><button class="btn" data-reset-v4>Xóa nhật ký v4 sau khi xác nhận</button><a class="btn" href="./legacy-v2.html" target="_blank" rel="noopener">Mở giao diện FIT55 cũ</a></div></div>')
}
function exportJson(){
const obj={type:'FIT55_BACKUP',version:4,exportedAt:new Date().toISOString(),state,originalV1:originalRaw('fit55-v1'),originalProfileV2:originalRaw('fit55-profile-v2')};
const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='fit55-backup-'+dateNow()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function daySummary(){
const w=activeWorkout(),l=sessionLog(),total=w.exercises.reduce((n,x)=>n+x.sets,0);
let done=0,tonnage=0,exNames=[];
w.exercises.forEach((ex,i)=>{let id=actualExercise(selectedWeek,selectedDay,i,ex.id),sets=l[id]||[];let n=sets.filter(x=>x?.done).length;if(n)exNames.push(D.EXERCISES[id].name);done+=n;tonnage+=sets.filter(x=>x?.done).reduce((a,x)=>a+(+x.kg||0)*(+x.reps||0),0)});
modal('Tổng kết '+w.code,'<div class="stack"><div class="grid g3"><div class="tile"><div class="micro">Set hoàn thành</div><h3>'+done+'/'+total+'</h3></div><div class="tile"><div class="micro">Bài có log</div><h3>'+exNames.length+'/'+w.exercises.length+'</h3></div><div class="tile"><div class="micro">Tổng kg × reps</div><h3>'+money(tonnage)+'</h3></div></div><div class="notice">Tonnage chỉ là chỉ số khối lượng tập gần đúng, không thể so trực tiếp giữa các máy và đặc biệt không dùng như mức tải thật đối với assisted pull-up.</div><p class="quiet"><b>Ngày:</b> '+escape(trainingDate)+' · <b>Tuần:</b> '+selectedWeek+' · <b>Buổi:</b> '+escape(w.title)+'</p><p class="quiet"><b>Các bài đã ghi:</b> '+escape(exNames.join(', ')||'Chưa có')+'</p><p class="quiet"><b>Cardio gợi ý:</b> '+escape(w.cardio)+'</p><div class="notice green">Tăng tiến tốt là khi giữ kỹ thuật, hồi phục tốt và dần tăng reps hoặc một nấc tạ nhỏ, không phải buổi nào cũng đau nhức.</div></div>')
}
function weeklyReview(){
const cfg=D.weekOf(selectedWeek);
modal('Đánh giá tuần '+selectedWeek,'<div class="stack"><h3>'+escape(cfg.focus)+'</h3><div class="notice"><b>Kế hoạch W'+selectedWeek+':</b> '+escape(cfg.action)+' · '+escape(cfg.setDescription)+' · RIR '+escape(cfg.rir)+'.</div>'+(cfg.checkpoint?'<div class="notice green">Mốc kiểm tra: ghi cân trung bình 7 ngày, đo eo/bụng/mông/đùi/tay và đánh giá sức mạnh mông.</div>':'')+'<div class="notice">Ghi chép cuối tuần: số buổi hoàn thành, đau cơ, ngủ, năng lượng và tạ đã dùng. Giảm set khi hồi phục kém, không tự động giảm kcal do dao động cân ngắn hạn.</div><div class="checklist">'+D.BASE.map((x,i)=>'<div class="item"><b>'+x.label+' · '+x.code+'</b><span>'+x.title+'</span></div>').join('')+'</div><p class="quiet"><b>Trọng tâm phase:</b> '+escape(D.phaseOf(selectedWeek).emphasis)+'</p></div>')
}
function captureMeasure(form){
const a=Object.fromEntries(new FormData(form));if(a.date===BASE.date){toast('Mốc InBody gốc 16/10 được cố định; chọn ngày khác để cập nhật.');return}
let rec={date:a.date};for(const k of ['weight','waist','navel','hip','thigh','arm','calf','chest','underbust','fat','muscle','pbf','water'])if(a[k]!==''&&a[k]!==undefined)rec[k]=+a[k];
if(Object.keys(rec).length===1){toast('Hãy nhập ít nhất một chỉ số.');return}
if(a.cycle)rec.cycle=String(a.cycle).slice(0,110);
state.measurements=state.measurements.filter(x=>x.date!==rec.date);state.measurements.push(rec);save();closeModal();render();toast('Đã lưu số đo ngày '+rec.date)
}
function captureGoal(form){
let target=Number($('#goal-weight').value);if(!Number.isFinite(target)||target<40||target>80){toast('Cân nặng mục tiêu phải trong khoảng hợp lệ.');return}
state.profile.target=target;
for(const f of D.MEASURE_FIELDS){let v=$('#goal-'+f.key).value; if(v==='')delete state.profile.goals[f.key];else state.profile.goals[f.key]=+v}
save();closeModal();render();toast('Đã lưu mục tiêu hình thể')
}
function saveFood(form){
const data=Object.fromEntries(new FormData(form)),f=D.FOODS.find(x=>x.id===data.food),grams=+data.grams;
if(!grams||grams<=0||grams>2500){toast('Khối lượng phải trong khoảng hợp lệ.');return}
const ratio=grams/100,entry={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),date:nutritionDate,meal:data.meal,grams,note:String(data.note||'').slice(0,130)};
if(f){entry.name=f.name;entry.kcal=Math.round(f.kcal*ratio);entry.protein=+(f.protein*ratio).toFixed(1);entry.carb=+(f.carb*ratio).toFixed(1);entry.fat=+(f.fat*ratio).toFixed(1)}
else{entry.name=data.note||'Món tự nhập';entry.kcal=+data.kcal||0;entry.protein=+data.protein||0;entry.carb=0;entry.fat=0}
state.meals.push(entry);save();render();toast('Đã ghi bữa ăn. Dữ liệu là ước lượng.')
}
let restLeft=0,restTimerId=null,restPaused=false,restTotal=0;
function drawRest(){
const el=$('#resttimer');if(!el)return;
if(restLeft<=0){el.hidden=true;el.innerHTML='';return}
el.hidden=false;const mm=String(Math.floor(restLeft/60)).padStart(2,'0'),ss=String(restLeft%60).padStart(2,'0');
el.innerHTML='<div><div class="micro">REST TIMER · NGHỈ GIỮA SET</div><b>'+mm+':'+ss+'</b> <span class="meta"> / '+restTotal+' giây</span></div><div class="actions"><button class="btn small" data-rest-control="toggle">'+(restPaused?'Tiếp tục':'Tạm dừng')+'</button><button class="btn small" data-rest-control="skip">Bỏ qua</button></div>'
}
function stopRest(){if(restTimerId!==null){clearInterval(restTimerId);restTimerId=null}restLeft=0;restPaused=false;drawRest()}
function startRest(seconds){
if(restTimerId!==null)clearInterval(restTimerId);
restLeft=Math.max(15,Math.round(seconds||75));restTotal=restLeft;restPaused=false;drawRest();
restTimerId=setInterval(()=>{if(!restPaused){restLeft--;if(restLeft<=0){stopRest();toast('Đã hết thời gian nghỉ — tập tiếp khi sẵn sàng.')}else drawRest()}},1000)
}

function importMeasurements(file){
if(!file)return;
if(file.size>40000){toast('File số đo quá lớn, hãy dùng bản JSON đúng định dạng.');return}
file.text().then(raw=>{
const obj=JSON.parse(raw);
if(obj.type!=='FIT55_MEASUREMENT'||obj.version!==1||!obj.measurement||typeof obj.measurement!=='object'||Array.isArray(obj.measurement))throw Error('Không đúng định dạng FIT55_MEASUREMENT');
const measurement=obj.measurement,date=measurement.date;
if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00'))||date===BASE.date)throw Error('Ngày đo không hợp lệ hoặc trùng mốc gốc InBody');
const ranges={weight:[30,180],chest:[40,150],underbust:[35,150],waist:[35,150],navel:[35,180],hip:[45,180],thigh:[20,100],arm:[10,70],calf:[15,80],fat:[0,80],muscle:[0,65],pbf:[0,70],water:[0,80]};
let values={};
for(const [key,[lo,hi]] of Object.entries(ranges)){
if(measurement[key]===undefined||measurement[key]===null||measurement[key]==='')continue;
let val=measurement[key];
if(typeof val!=='number'||!Number.isFinite(val)||val<lo||val>hi)throw Error('Số đo '+key+' ngoài khoảng hợp lệ');
values[key]=val;
}
if(!Object.keys(values).length)throw Error('Không có số đo hợp lệ');
const existing=state.measurements.find(m=>m.date===date);
const summary=Object.entries(values).map(([k,v])=>k+' '+v).join(' · ');
if(!confirm('Nhập số đo ngày '+date+' vào FIT55 trên thiết bị này?\n'+summary+'\n'+(existing?'Chỉ cập nhật chỉ số có trong file; các chỉ số khác cùng ngày vẫn giữ.':'Lịch sử tập và dinh dưỡng không bị ảnh hưởng.')))return;
const record={...(existing||{}),date,...values};
if(typeof measurement.note==='string')record.note=measurement.note.slice(0,200);
if(typeof measurement.cycle==='string')record.cycle=measurement.cycle.slice(0,110);
state.measurements=state.measurements.filter(m=>m.date!==date);state.measurements.push(record);
save();view('goals');toast('Đã nhập bộ số đo '+date+' vào thiết bị này.');
}).catch(e=>toast('Không thể nhập số đo: '+String(e.message||e).slice(0,100)));
}
function dataImport(file){
if(!file)return;
file.text().then(raw=>{
const obj=JSON.parse(raw);
if(obj.type==='FIT55_BACKUP'&&obj.version===4&&obj.state&&Array.isArray(obj.state.measurements)&&obj.state.workouts&&obj.state.profile){
if(!confirm('Thay thế dữ liệu FIT55 hiện tại bằng bản sao lưu đã chọn?'))return;
state={...obj.state,version:4};
save();view('today');closeModal();toast('Đã khôi phục sao lưu FIT55 v4')
}else if(obj.state&&Array.isArray(obj.state.measurements)&&obj.state.workouts){
if(!confirm('Nhập dữ liệu FIT55 phiên bản cũ? Thao tác sẽ giữ dữ liệu mới dưới dạng bản sao lưu cũ.'))return;
state.archive={workouts:obj.state.workouts,meals:obj.state.food||[]};state.measurements=obj.state.measurements;save();view('today');closeModal();toast('Đã nhập nhật ký và số đo phiên bản cũ')
}else throw Error('Sai cấu trúc file');
}).catch(e=>toast('Không thể nhập JSON: '+e.message.slice(0,90)));
}
document.addEventListener('click',e=>{
const n=e.target.closest('[data-nav]');if(n){view(n.dataset.nav);return}
const ex=e.target.closest('[data-ex-open]');if(ex){const origin=e.target.closest('#view')?.querySelector('#training-date')!==null&&section==='training';let w=activeWorkout(),idx=w.exercises.findIndex((x,i)=>actualExercise(selectedWeek,selectedDay,i,x.id)===ex.dataset.exOpen);exDetail(ex.dataset.exOpen,origin,Math.max(0,idx));return}
const rep=e.target.closest('[data-replace]');if(rep){const [w,d,i,id]=rep.dataset.replace.split('|');state.overrides[['P2',w,d,i].join('|')]=id;save();closeModal();render();toast('Đã thay bài cho đúng tuần & buổi');return}
const restControl=e.target.closest('[data-rest-control]');
if(restControl){if(restControl.dataset.restControl==='skip')stopRest();else{restPaused=!restPaused;drawRest()}return}
if(e.target.closest('[data-help-rir]')){modal('RIR và cách chọn mức tạ','<div class="stack"><p><b>RIR (Reps in Reserve)</b> = số lần bạn ước tính vẫn có thể thực hiện thêm với kỹ thuật đúng trước khi thất bại.</p><div class="checklist"><div class="item">RIR 4 <span>Khá nhẹ, phù hợp tập lại và giảm tải</span></div><div class="item">RIR 2–3 <span>Vừa đủ thử thách, mục tiêu phần lớn các tuần</span></div><div class="item">RIR 0–1 <span>Rất gần kiệt sức, không ưu tiên hiện tại</span></div></div><div class="notice">Ví dụ mục tiêu 10 reps ở RIR 3: bạn làm 10 lần và ước tính vẫn còn khoảng 3 lần với form tốt. Nếu còn đau khi vận động, giảm tạ hoặc số set thay vì cố đủ rep.</div><p class="quiet">Muốn tăng tạ: hoàn thành đủ rep cao nhất của khoảng reps trong tất cả set, còn RIR khoảng 2 và không đau khớp. Với máy assisted pull-up, giảm kg <b>trợ lực</b> mới là tăng độ khó.</p></div>');return}
const wk=e.target.closest('[data-week]');if(wk){selectedWeek=+wk.dataset.week;render();return}
const dy=e.target.closest('[data-day]');if(dy){selectedDay=+dy.dataset.day;render();return}
const chart=e.target.closest('[data-chart]');if(chart){chartMeasure=chart.dataset.chart;render();return}
const mode=e.target.closest('[data-mode]');if(mode){nutritionMode=mode.dataset.mode;render();return}
const bm=e.target.closest('[data-open-measure]');if(bm){modal('Ghi nhận số đo & InBody',measurementForm());return}
const gm=e.target.closest('[data-open-goal]');if(gm){modal('Thiết lập mục tiêu hình thể',goalForm());return}
const mm=e.target.closest('[data-edit-measure]');if(mm){modal('Chỉnh sửa bản ghi '+mm.dataset.editMeasure,measurementForm(state.measurements.find(x=>x.date===mm.dataset.editMeasure)));return}
if(e.target.closest('[data-close-modal]')){closeModal();return}
if(e.target.closest('[data-open-data]')){dataModal();return}
if(e.target.closest('[data-export]')){exportJson();toast('Đã tạo file sao lưu JSON');return}
if(e.target.closest('[data-session-summary]')){daySummary();return}
if(e.target.closest('[data-workout-review]')){weeklyReview();return}
const del=e.target.closest('[data-del-meal]');if(del){state.meals=state.meals.filter(x=>x.id!==del.dataset.delMeal);save();render();toast('Đã xóa bữa ăn');return}
if(e.target.closest('[data-reset-v4]')){if(confirm('Bạn đã xuất sao lưu chưa? Xóa toàn bộ log FIT55 v4, giữ số đo InBody gốc và giữ dữ liệu cũ?')){let arch=state.archive;state=migrateLegacy();state.archive=arch;save();closeModal();view('today')}return}
});
document.addEventListener('change',e=>{
const inp=e.target.closest('[data-setinput]');
if(inp){
let [i,j,field]=inp.dataset.setinput.split('|'),w=activeWorkout(),ex=w.exercises[+i],id=actualExercise(selectedWeek,selectedDay,+i,ex.id),key=trainingKey(selectedWeek,selectedDay,trainingDate);
const session=state.workouts[key]||(state.workouts[key]={});const arr=session[id]||(session[id]=[]);const set=arr[+j]||(arr[+j]={});
set[field]=field==='done'?inp.checked:inp.value===''?null:+inp.value;
save();if(field==='done'&&inp.checked)startRest(D.EXERCISES[id]?.rest||75);
let completed=0,total=0;const current=sessionLog();w.exercises.forEach((b,i)=>{let eid=actualExercise(selectedWeek,selectedDay,i,b.id);total+=b.sets;completed+=(current[eid]||[]).slice(0,b.sets).filter(x=>x?.done).length});const badge=$('#session-count'),progress=$('#session-bar');if(badge)badge.innerHTML=completed+'/'+total+' <small>set</small>';if(progress)progress.style.width=(total?100*completed/total:0)+'%';
const finishEx=(current[id]||[]).slice(0,ex.sets).filter(x=>x?.done).length;
const status=$('[data-ex-count="'+i+'"]');
if(status)status.textContent=finishEx+'/'+ex.sets+' hoàn thành';
return;
}
if(e.target.id==='training-date'){trainingDate=e.target.value||dateNow();render();return}
if(e.target.id==='nutrition-date'){nutritionDate=e.target.value||dateNow();render();return}
if(e.target.id==='library-group'){detailMuscle=e.target.value;render();return}
if(e.target.id==='meal-food'){const f=D.FOODS.find(x=>x.id===e.target.value);const form=e.target.closest('form');if(f){form.elements.kcal.disabled=true;form.elements.protein.disabled=true}else{form.elements.kcal.disabled=false;form.elements.protein.disabled=false}return}
if(e.target.id==='measurement-import'){importMeasurements(e.target.files?.[0]);return}
if(e.target.id==='data-import'){dataImport(e.target.files?.[0]);return}
});
document.addEventListener('input',e=>{
if(e.target.id==='library-search'){const pos=e.target.selectionStart;detailFilter=e.target.value;const list=e.target;const viewport=window.scrollY;render();const input=$('#library-search');input?.focus();input?.setSelectionRange(pos,pos);window.scrollTo(0,viewport)}
});
document.addEventListener('submit',e=>{
const form=e.target;e.preventDefault();
if(form.id==='measure-form'){captureMeasure(form);return}
if(form.id==='goal-form'){captureGoal(form);return}
if(form.id==='meal-form'){saveFood(form);return}
if(form.id==='check-form'){
const x=Object.fromEntries(new FormData(form));
if(!x.date)return;
const v={date:x.date,pain:+x.pain,energy:x.energy,sleep:x.sleep?+x.sleep:null,note:x.note||''};
state.checkins=state.checkins.filter(a=>a.date!==x.date);state.checkins.push(v);save();render();toast('Đã lưu check-in '+x.date);return;
}
if(form.id==='nutrition-settings'){
const v=Object.fromEntries(new FormData(form));for(const k of ['calories','protein','carb','fat'])v[k]=+v[k];
if(v.calories<1200||v.calories>3500||v.protein<40||v.protein>220||v.carb<0||v.fat<0){toast('Vui lòng kiểm tra giới hạn năng lượng/macro.');return}
state.profile={...state.profile,...v};save();render();toast('Đã lưu khung giờ & dinh dưỡng');return;
}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modalroot').innerHTML)closeModal()});
function boot(){
renderLayout();view('today');
}
boot();
})();