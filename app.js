// app.js
(function(){
  var $ = function(id){ return document.getElementById(id); };
  // hide banner if JS runs
  var warn=$('jswarn'); if(warn) warn.style.display='none';

  function fc_num(id){ var v = ($(id).value||'').trim(); return v? Number(v) : NaN; }
  function fc_fmtH(hours){ if(!isFinite(hours)) return '--:--'; var m=Math.max(0, Math.round(hours*60)); var h=Math.floor(m/60), mm=m%60; return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }

  function fc_calc(){
    var start=fc_num('fc_start'), end=fc_num('fc_end'), hov=fc_num('fc_hov_burn');
    var dist=fc_num('fc_dist'), tas=fc_num('fc_tas'), cburn=fc_num('fc_cru_burn'), back=fc_num('fc_dist_back');
    var out=$('fc_out');
    if([start,end,hov,dist,tas,cburn,back].some(function(x){return !isFinite(x) || x<0;}) || tas===0){
      out.innerHTML='<div style="color:red">Check inputs.</div>'; return;
    }
    var t_out=dist/tas, f_out=cburn*t_out, fuel_on_scene=start-f_out;
    var t_back=back/tas, f_back=cburn*t_back, bingo=end+f_back;
    var f_avail=fuel_on_scene-bingo, t_hover=f_avail/hov;
    var good=t_hover>=0;
    out.innerHTML='<b>Fuel on Scene:</b> '+fuel_on_scene.toFixed(0)+'<br>'
      +'<b>Bingo:</b> '+bingo.toFixed(0)+'<br>'
      +'<b>On‑Scene Time:</b> '+fc_fmtH(t_hover)+' '+(good?'GOOD':'SHORT');
  }
  function fc_clear(){ ['fc_start','fc_end','fc_hov_burn','fc_dist','fc_tas','fc_cru_burn','fc_dist_back'].forEach(function(id){ $(id).value=''; }); $('fc_out').innerHTML=''; }
  function fc_prefill(){ $('fc_start').value='1500'; $('fc_end').value='400'; $('fc_dist').value='40'; $('fc_tas').value='120'; $('fc_cru_burn').value='600'; $('fc_dist_back').value='40'; $('fc_hov_burn').value='700'; fc_calc(); }

  $('fc_btn_calc').addEventListener('click', fc_calc);
  $('fc_btn_clear').addEventListener('click', fc_clear);
  $('fc_btn_prefill').addEventListener('click', fc_prefill);
})();