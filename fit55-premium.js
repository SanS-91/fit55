/* FIT55 Premium UI — presentation layer over the existing data model.
   Does not replace user data, fitness calculations, or existing event handlers. */
(function(){
  'use strict';
  const shell=document.querySelector('.shell');
  if(!shell||!document.querySelector('nav.tabs'))return;
  const navData=[
    {id:'workout',label:'Hôm nay & lịch tập',short:'Hôm nay',icon:'home',section:'HÀNH TRÌNH'},
    {id:'roadmap',label:'Mục tiêu 55 kg',short:'Mục tiêu',icon:'target'},
    {id:'weekly',label:'Lộ trình 28 tuần',short:'Lộ trình',icon:'calendar'},
    {id:'library',label:'Thư viện bài tập',short:'Bài tập',icon:'book'},
    {id:'progress',label:'Số đo & tiến độ',short:'Tiến độ',icon:'chart',section:'SỨC KHỎE'},
    {id:'food',label:'Dinh dưỡng',short:'Ăn uống',icon:'leaf'},
    {id:'routine',label:'Giờ ăn & sinh hoạt',short:'Thời gian',icon:'clock'},
    {id:'data',label:'Dữ liệu & sao lưu',short:'Dữ liệu',icon:'database',section:'CÀI ĐẶT'}
  ];
  const icons={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/><path d="m8 15 2 2 5-5"/>',
    book:'<path d="M4 4.8c3-1.1 5.8-.6 8 1.1 2.2-1.7 5-2.2 8-1.1v14c-3-1.1-5.8-.6-8 1.1-2.2-1.7-5-2.2-8-1.1Z"/><path d="M12 6v14"/>',
    chart:'<path d="M4 20V5m0 15h17"/><path d="m7 16 4-5 3 3 5-7"/>',
    leaf:'<path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16Z"/><path d="M5 19c4-5 7-8 12-11"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    spark:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  function svg(name){return '<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.spark)+'</svg>'}
  function originalTab(id){return document.querySelector('nav.tabs [data-tab="'+id+'"]')}
  const originalHeader=shell.querySelector(':scope > header');
  const metrics=shell.querySelector(':scope > .grid');
  const tabs=shell.querySelector(':scope > nav.tabs');
  const main=shell.querySelector(':scope > main');
  const footer=shell.querySelector(':scope > footer');
  if(!originalHeader||!metrics||!main)return;
  const pieces=Array.from(shell.children);
  const workspace=document.createElement('div');
  workspace.className='fit-workspace';
  for(const item of pieces)workspace.appendChild(item);
  const side=document.createElement('aside');
  side.className='fit-sidebar';
  side.innerHTML='<a class="fit-brand" href="#" aria-label="FIT55 - về trang đầu"><span class="fit-brand-icon">F<span>55</span></span><span class="fit-brand-text"><b>Fit55</b><small>PERSONAL WELLNESS</small></span></a><nav class="fit-side-links" aria-label="Điều hướng FIT55"></nav><div class="fit-sidebar-bottom"><div class="flower">✧</div><b>Progress, not perfection.</b><p>Giảm mỡ theo nhịp riêng, giữ sức mạnh và chăm sóc cơ thể bền vững.</p></div>';
  const sideLinks=side.querySelector('.fit-side-links');
  for(const item of navData){
    if(item.section){const head=document.createElement('div');head.className='fit-nav-heading';head.textContent=item.section;sideLinks.appendChild(head)}
    const b=document.createElement('button');b.type='button';b.className='fit-nav-link';b.dataset.navigate=item.id;b.innerHTML='<span class="fit-icon">'+svg(item.icon)+'</span><span>'+item.label+'</span><span class="nav-chevron">›</span>';sideLinks.appendChild(b);
  }
  shell.appendChild(side);shell.appendChild(workspace);
  side.querySelector('.fit-brand').onclick=e=>{e.preventDefault();activate('workout')};
  originalHeader.style.display='none';
  tabs.style.display='none';
  main.classList.add('fit-content');
  metrics.classList.add('fit-topstats');
  if(footer)footer.classList.add('fit-mini-footer');
  const topbar=document.createElement('div');
  topbar.className='fit-topbar';
  const dateText=new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
  topbar.innerHTML='<div><div class="fit-crumb" id="fit-breadcrumb">FIT55 · MY JOURNEY</div><div class="fit-title" id="fit-page-title">Hôm nay của bạn</div></div><div class="fit-header-actions"><div class="fit-date">'+dateText+'</div><div id="fit-export-position"></div><div class="fit-avatar" aria-hidden="true">55</div></div>';
  workspace.insertBefore(topbar,metrics);
  const exportButton=document.getElementById('export');
  topbar.querySelector('#fit-export-position').replaceWith(exportButton);
  exportButton.textContent='↓ Sao lưu';
  const hero=document.createElement('div');
  hero.className='fit-hero';
  hero.innerHTML='<div class="fit-hero-copy"><div class="fit-eyebrow">PERSONAL BODY JOURNEY</div><h2>Be stronger.<br><em>Feel lighter.</em></h2><p>4 buổi tập mỗi tuần, bữa ăn đúng nhịp sinh hoạt và một hành trình giảm mỡ không đánh đổi sức mạnh.</p><div class="fit-hero-ctas"><button type="button" class="fit-action primary" data-action="start">Xem buổi tập hôm nay &nbsp; →</button><button type="button" class="fit-action" data-action="progress">Xem số đo cơ thể</button></div></div><div class="fit-hero-stats"><div class="fit-goal-ring" id="fit-goal-ring"><div class="fit-ring-inside"><small>GOAL WEIGHT</small><b>55.0</b><span>kg · mục tiêu</span></div></div></div>';
  workspace.insertBefore(hero,metrics);
  hero.querySelector('[data-action="start"]').onclick=()=>activate('workout',true);
  hero.querySelector('[data-action="progress"]').onclick=()=>activate('progress');
  const heading=document.createElement('div');
  heading.className='fit-panebar';
  workspace.insertBefore(heading,main);
  const overview=document.createElement('div');
  overview.className='fit-overview-grid';
  overview.innerHTML='<div class="fit-overview-card peach"><div class="overline">YOUR NEXT SESSION</div><h3 id="fit-next-title">Lịch tập cá nhân</h3><p id="fit-next-detail">45 phút tập tạ · cardio linh hoạt tùy khả năng hồi phục</p><div class="fit-overview-tiles"><span>4 buổi/tuần</span><span>19:30</span><span>Lower / Upper</span></div><div class="fit-overview-cta"><span class="fit-time-pill" id="fit-next-day">Theo lịch</span><button class="fit-action primary" id="fit-open-session">Mở lịch tập →</button></div></div><div class="fit-overview-card mint"><div class="overline">NUTRITION & RECOVERY</div><h3>Chăm sóc cả ngoài phòng tập</h3><p>Protein, giờ ăn, giấc ngủ và hồi phục quan trọng không kém bài tập.</p><div class="fit-overview-tiles"><span>1.650–1.750 kcal*</span><span>100–115g protein*</span><span>Giấc ngủ 7–9 giờ</span></div><div class="fit-overview-cta"><span class="fit-time-pill">*Mục tiêu khởi điểm</span><button class="fit-inline-link" id="fit-open-meal">Xem thời gian biểu →</button></div></div>';
  main.insertBefore(overview,main.firstChild);
  overview.querySelector('#fit-open-meal').onclick=()=>activate('routine');
  const nextSession=(()=>{
    const dates=[{weekday:1,index:0,label:'Thứ 2 · 19:30',title:'Lower A · Mông & đùi sau'},
      {weekday:2,index:1,label:'Thứ 3 · 19:30',title:'Upper A · Lưng & vai sau'},
      {weekday:4,index:2,label:'Thứ 5 · 19:30',title:'Lower B · Chân & mông'},
      {weekday:5,index:3,label:'Thứ 6 · 19:30',title:'Upper B · Lưng & ngực'}];
    let now=new Date(),cur=now.getDay()*1440+now.getHours()*60+now.getMinutes(),best=null;
    for(const x of dates){let ahead=(x.weekday-now.getDay()+7)%7;let minutes=ahead*1440+19*60+30-(now.getHours()*60+now.getMinutes());if(minutes<0)minutes+=10080;if(!best||minutes<best.minutes)best={...x,minutes};}
    return best;
  })();
  overview.querySelector('#fit-next-title').textContent=nextSession.title;
  overview.querySelector('#fit-next-day').textContent=nextSession.label;
  overview.querySelector('#fit-open-session').onclick=()=>{activate('workout',true);const b=document.querySelector('#days [data-day="'+nextSession.index+'"]');if(b)b.click();document.querySelector('#workoutdetail')?.scrollIntoView({behavior:'smooth',block:'start'})};
  const navMobile=document.createElement('nav');navMobile.className='fit-bottom-nav';navMobile.setAttribute('aria-label','Điều hướng nhanh');
  const mobileItems=[['workout','Hôm nay','home'],['roadmap','Mục tiêu','target'],['food','Ăn uống','leaf'],['progress','Tiến độ','chart'],['more','Xem thêm','more']];
  for(const [id,title,ico] of mobileItems){const b=document.createElement('button');b.type='button';b.className='fit-bottom-link';b.dataset.mobile=id;b.innerHTML='<span class="fit-icon">'+svg(ico)+'</span><span>'+title+'</span>';navMobile.appendChild(b)}
  document.body.appendChild(navMobile);
  const moreMenu=document.createElement('div');moreMenu.className='fit-more-menu hidden';moreMenu.innerHTML='<div class="fit-more-title">Khám phá FIT55 <button type="button" id="fit-more-close" aria-label="Đóng">×</button></div><div class="fit-more-links"></div>';
  for(const item of navData){const b=document.createElement('button');b.type='button';b.className='fit-more-link';b.dataset.more=item.id;b.innerHTML='<span>'+svg(item.icon)+'</span><b>'+item.label+'</b><span>›</span>';moreMenu.querySelector('.fit-more-links').appendChild(b)}
  document.body.appendChild(moreMenu);
  function closeMore(){moreMenu.classList.add('hidden');document.body.classList.remove('fit-more-open')}
  navMobile.querySelectorAll('[data-mobile]').forEach(b=>b.onclick=()=>{if(b.dataset.mobile==='more'){moreMenu.classList.toggle('hidden');document.body.classList.toggle('fit-more-open',!moreMenu.classList.contains('hidden'))}else activate(b.dataset.mobile)});
  moreMenu.querySelector('#fit-more-close').onclick=closeMore;
  moreMenu.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>activate(b.dataset.more));
  document.querySelectorAll('[data-navigate]').forEach(b=>b.onclick=()=>activate(b.dataset.navigate));
  const pageTitles={
    workout:['Hôm nay của bạn','FIT55 · PERSONAL ROUTINE','Your weekly rhythm','Lịch tập được thiết kế cho mục tiêu 55 kg'],
    roadmap:['Mục tiêu hình thể','YOUR BODY GOALS','Hành trình của bạn','Giảm mỡ và giữ sức mạnh'],
    weekly:['Lộ trình từng tuần','YOUR 28-WEEK PROGRAM','Từng bước tiến bộ','Kế hoạch có thể điều chỉnh theo hồi phục'],
    library:['Thư viện bài tập','MOVEMENT LIBRARY','Hiểu cơ thể, tập đúng','Nhóm cơ, kỹ thuật và lựa chọn thay thế'],
    progress:['Số đo & tiến độ','BODY INSIGHTS','Nhìn thấy sự thay đổi','Theo dõi cân, vòng đo và cơ thể theo thời gian'],
    food:['Dinh dưỡng','NUTRITION JOURNAL','Ăn đủ để khỏe hơn','Ghi nhận năng lượng và protein'],
    routine:['Thời gian biểu','DAILY RHYTHM','Một ngày cân bằng','Giờ ăn, tập luyện và nghỉ ngơi'],
    data:['Quản lý dữ liệu','DATA & PRIVACY','Dữ liệu của bạn','Sao lưu và khôi phục nhật ký']
  };
  let active='workout';
  function activate(id,scrollToWorkout=false){
    const original=originalTab(id);if(!original)return;
    original.click();active=id;closeMore();syncView();
    if(scrollToWorkout)document.querySelector('#workout .card')?.scrollIntoView({behavior:'smooth',block:'start'});
    else window.scrollTo({top:0,behavior:'smooth'});
  }
  function syncView(){
    const t=pageTitles[active]||pageTitles.workout;
    document.querySelector('#fit-breadcrumb').textContent=t[1];
    document.querySelector('#fit-page-title').textContent=t[0];
    heading.innerHTML='<div><div class="fit-label">'+t[2]+'</div><strong>'+t[0]+'</strong><div class="fit-sub">'+t[3]+'</div></div>';
    side.querySelectorAll('[data-navigate]').forEach(b=>{const yes=b.dataset.navigate===active;b.classList.toggle('active',yes);if(yes)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    navMobile.querySelectorAll('[data-mobile]').forEach(b=>b.classList.toggle('active',b.dataset.mobile===active||(!mobileItems.some(m=>m[0]===active)&&b.dataset.mobile==='more')));
    hero.classList.toggle('hidden',active!=='workout');
    overview.classList.toggle('hidden',active!=='workout');
    metrics.classList.toggle('hidden',active!=='workout'&&active!=='progress');
    document.body.dataset.view=active;
  }
  function syncGoal(){
    const current=Number((document.querySelector('#latest')?.textContent||'63.3').replace(',','.').match(/\d+(\.\d+)?/)?.[0]||63.3);
    const pct=Math.max(0,Math.min(100,(63.3-current)/8.3*100));
    document.querySelector('#fit-goal-ring')?.style.setProperty('--goal-angle',pct.toFixed(1)+'%');
    const remaining=Math.max(0,current-55);
    const p=hero.querySelector('.fit-hero-copy p');
    if(p)p.textContent='Từ 63.3 kg đến 55 kg · hiện còn khoảng '+remaining.toFixed(1)+' kg theo lần cân mới nhất. Tập đều, ăn đủ đạm và ưu tiên hồi phục.';
  }
  syncGoal();
  const weightEl=document.querySelector('#latest');
  if(weightEl){new MutationObserver(syncGoal).observe(weightEl,{childList:true,subtree:true,characterData:true})}
  const muscleMap={
    'Hip thrust':['Mông lớn','Đùi sau'], 'Romanian deadlift':['Đùi sau','Mông lớn'],
    'Leg curl':['Đùi sau',''], 'Hip abductor':['Mông bên',''], 'Dead bug':['Core',''],
    'Assisted pull-up':['Cơ xô','Tay trước'], 'Lat pulldown':['Cơ xô','Tay trước'],
    'Single-arm DB row':['Lưng giữa','Cơ xô'], 'Reverse pec deck':['Vai sau','Lưng trên'],
    'Incline chest press':['Ngực','Tay sau'], 'Single-leg press':['Đùi trước','Mông'],
    'Bulgarian split squat':['Mông','Đùi trước'], 'Glute bridge':['Mông lớn',''],
    'Plank':['Core',''], 'Chest-supported row':['Lưng giữa','Cơ xô'],
    'Neutral-grip lat pulldown':['Cơ xô','Tay trước'], 'Seated cable row':['Lưng giữa','Cơ xô'],
    'Chest press':['Ngực','Tay sau'], 'Straight-arm pulldown':['Cơ xô',''],
    'Triceps pushdown':['Tay sau','']
  };
  function decorateWorkout(){
    document.querySelectorAll('#workoutdetail .exercise:not([data-muscle-added])').forEach(row=>{
      row.dataset.muscleAdded='yes';
      const name=row.querySelector('.exname')?.textContent?.trim()||'';
      const muscles=muscleMap[name];
      if(!muscles)return;
      const desc=row.querySelector('.exdesc');
      if(!desc)return;
      const holder=document.createElement('div');
      for(const [i,m] of muscles.entries()){if(!m)continue;const tag=document.createElement('span');tag.className='ex-muscle'+(i?' secondary':'');tag.textContent=(i?'Phụ: ':'Chính: ')+m;holder.appendChild(tag);}
      desc.insertAdjacentElement('afterend',holder);
    });
  }
  const workoutDetail=document.querySelector('#workoutdetail');
  if(workoutDetail){
    const watch=new MutationObserver(()=>decorateWorkout());
    watch.observe(workoutDetail,{childList:true,subtree:true});
    decorateWorkout();
  }
  const phaseRail=document.createElement('div');phaseRail.className='week-phase-rail';
  const phases=[['01–02','Return & Recovery',1],['03–06','Build Consistency',3],['07–14','Fat Loss & Shape',7],['15–22','Refinement',15],['23–28','Maintain',23]];
  phaseRail.innerHTML=phases.map((p,i)=>'<button type="button" data-phase-week="'+p[2]+'" class="'+(i===0?'selected':'')+'"><small>W'+p[0]+'</small><b>'+p[1]+'</b></button>').join('');
  const weekSelector=document.querySelector('#week-selector');if(weekSelector){
    weekSelector.before(phaseRail);
    phaseRail.querySelectorAll('[data-phase-week]').forEach(b=>b.onclick=()=>{
      const week=+b.dataset.phaseWeek;
      const orig=document.querySelector('#week-selector [data-week="'+week+'"]');
      if(orig)orig.click();
      refreshPhases();
    });
    function refreshPhases(){
      const current=Number(document.querySelector('#week-selector [data-week].active')?.dataset.week||1);
      phaseRail.querySelectorAll('[data-phase-week]').forEach((b,i)=>{
        const start=phases[i][2],end=i<phases.length-1?phases[i+1][2]-1:28;
        b.classList.toggle('selected',current>=start&&current<=end)
      })
    }
    weekSelector.addEventListener('click',e=>{if(e.target.closest('[data-week]'))requestAnimationFrame(refreshPhases)})
  }
  syncView();
})();
