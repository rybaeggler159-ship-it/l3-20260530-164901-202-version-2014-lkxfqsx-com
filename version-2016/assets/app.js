
(function(){
  function $(s,r){return (r||document).querySelector(s)}
  function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  var mt=$('.menu-toggle'), mn=$('.mobile-nav');
  if(mt&&mn){mt.addEventListener('click',function(){mn.classList.toggle('open')})}
  $all('.hero').forEach(function(hero){
    var slides=$all('.hero-slide',hero), dots=$all('.hero-dots button',hero), prev=$('.hero-prev',hero), next=$('.hero-next',hero), i=0;
    function show(n){if(!slides.length)return;i=(n+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle('active',k===i)});dots.forEach(function(d,k){d.classList.toggle('active',k===i)})}
    if(prev)prev.addEventListener('click',function(){show(i-1)}); if(next)next.addEventListener('click',function(){show(i+1)}); dots.forEach(function(d,k){d.addEventListener('click',function(){show(k)})});
    if(slides.length>1)setInterval(function(){show(i+1)},5200); show(0);
  });
  $all('.search-form').forEach(function(f){f.addEventListener('submit',function(e){var inp=f.querySelector('input[name="q"]'); if(inp&&inp.value.trim()){return} e.preventDefault();})});
  var params=new URLSearchParams(location.search), q=params.get('q')||''; var searchInput=$('.page-search-input'); if(searchInput&&q){searchInput.value=q}
  function applyFilters(){
    var keyword=(($('.page-search-input')||{}).value||'').toLowerCase().trim(), year=(($('.year-filter')||{}).value||''), region=(($('.region-filter')||{}).value||''), type=(($('.type-filter')||{}).value||'');
    $all('.movie-card').forEach(function(c){
      var hay=(c.dataset.title+' '+c.dataset.region+' '+c.dataset.type+' '+c.dataset.genre+' '+c.textContent).toLowerCase();
      var ok=(!keyword||hay.indexOf(keyword)>-1)&&(!year||c.dataset.year===year)&&(!region||c.dataset.region===region)&&(!type||c.dataset.type===type);
      c.classList.toggle('hidden-card',!ok);
    });
  }
  ['input','change'].forEach(function(ev){$all('.page-search-input,.year-filter,.region-filter,.type-filter').forEach(function(el){el.addEventListener(ev,applyFilters)})}); if(searchInput)applyFilters();
  $all('.player').forEach(function(box){
    var video=$('video',box), cover=$('.player-cover',box), src=box.getAttribute('data-hls');
    function start(){
      if(!video||!src)return;
      if(window.Hls&&window.Hls.isSupported()){var hls=new Hls(); hls.loadSource(src); hls.attachMedia(video);}
      else if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;}
      else{video.src=src;}
      box.classList.add('ready'); var p=video.play(); if(p&&p.catch)p.catch(function(){});
    }
    if(cover)cover.addEventListener('click',start); if(video)video.addEventListener('click',function(){if(video.paused)start()});
  });
})();
