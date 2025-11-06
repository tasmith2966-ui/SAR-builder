// app.js for v9.1 Mobile — Full feature set, fixed fuel rates, mobile layout
(function(){
  var FORM_ID='sar_kneeboard_v91_mobile_full';
  var $ = function(id){ return document.getElementById(id); };

  // Hide banner once JS executes
  var warn = $('jswarn'); if(warn) warn.style.display='none';

  // Theme restore
  try{ if(localStorage.getItem(FORM_ID+'_theme')==='night') document.body.classList.add('night'); }catch(e){}

  function flash(msg){
    try{
      var el=document.createElement('div'); el.textContent=msg;
      el.style.position='fixed'; el.style.bottom='16px'; el.style.left='50%'; el.style.transform='translateX(-50%)';
      el.style.background='rgba(0,0,0,.8)'; el.style.color='#c6ffb5'; el.style.padding='8px 12px';
      el.style.border='2px solid #244b24'; el.style.borderRadius='6px'; el.style.fontWeight='700'; el.style.zIndex='9999';
      document.body.appendChild(el); setTimeout(function(){ el.remove(); }, 1400);
    }catch(e){}
  }
  function autoGrow(el){ el.style.height='auto'; el.style.height=(el.scrollHeight+2)+'px'; }
  (function(){ var areas=document.querySelectorAll('textarea'); for(var i=0;i<areas.length;i++){ (function(t){ autoGrow(t); t.addEventListener('input', function(){autoGrow(t);}); })(areas[i]); } })();

  // Times
  function hhmmLocalNow(){ var d=new Date(); return String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0'); }
  function hhmmZulu(hhmm){
    if(!hhmm) return '';
    var hh=parseInt(hhmm.slice(0,2),10), mm=parseInt(hhmm.slice(2,4)||'0',10);
    if(isNaN(hh)||isNaN(mm)) return '';
    var now=new Date(), local=new Date(now); local.setHours(hh,mm,0,0);
    var z=new Date(local.getTime()+now.getTimezoneOffset()*60000);
    return String(z.getUTCHours()).padStart(2,'0') + String(z.getUTCMinutes()).padStart(2,'0');
  }
  function normalizeHHMM(s){
    if(!s) return '';
    s=s.replace(/[^0-9]/g,'').slice(0,4);
    if(s.length===3) s='0'+s;
    if(s.length<4) return s;
    var hh=Math.max(0, Math.min(23, parseInt(s.slice(0,2),10)));
    var mm=Math.max(0, Math.min(59, parseInt(s.slice(2,4),10)));
    return String(hh).padStart(2,'0') + String(mm).padStart(2,'0');
  }
  function attachSync(localId, zId){
    var le=$(localId), ze=$(zId); if(!le||!ze) return;
    function sync(){ var n=normalizeHHMM(le.value); le.value=n; ze.value=n?hhmmZulu(n):''; }
    le.addEventListener('input', sync); le.addEventListener('change', sync);
  }
  attachSync('brief_current_time','brief_current_time_z');
  attachSync('brief_call_time','brief_call_time_z');

  // Save/Load
  function serialize(){
    var ids=[
      'brief_current_time','brief_current_time_z','brief_call_time','brief_call_time_z',
      'brief_location','brief_search_object','brief_tasking','brief_reporting_source','brief_other_assets',
      'brief_weather','metar_station','brief_fuel_plan',
      'so_name','so_length','so_type','so_color','so_pob','so_position',
      'os_wind','os_ceiling','os_vis','os_airtemp','os_seas','os_swells',
      'sd_cpt','sd_leg','sd_width','sd_ts','sd_creep','sd_csp','sd_first',
      'evt_req_time_local','evt_req_time_z','evt_req_fuel','evt_req_pos',
      'evt_to_time_local','evt_to_time_z','evt_to_fuel','evt_to_pos',
      'evt_csp_time_local','evt_csp_time_z','evt_csp_fuel','evt_csp_pos',
      'evt_tgt_time_local','evt_tgt_time_z','evt_tgt_fuel','evt_tgt_pos',
      'evt_ohd_time_local','evt_ohd_time_z','evt_ohd_fuel','evt_ohd_pos',
      'evt_ds_time_local','evt_ds_time_z','evt_ds_fuel','evt_ds_pos',
      'evt_sd_time_local','evt_sd_time_z','evt_sd_fuel','evt_sd_pos',
      'comments','fc_start','fc_weight','fc_end','fc_dist','fc_tas','fc_dist_back'
    ];
    var o={}; for(var i=0;i<ids.length;i++){ var el=$(ids[i]); if(el) o[ids[i]]=el.value; }
    var checks=['chk_weather','chk_notams','chk_fuelstop','chk_adiz','chk_sign','chk_ifr','chk_ops','chk_sap','chk_flightsurgeon','chk_extragear'];
    for(i=0;i<checks.length;i++){ var c=$(checks[i]); if(c) o[checks[i]]=c.checked; }
    return o;
  }
  function hydrate(o){
    if(!o) return;
    for(var k in o){ if(!o.hasOwnProperty(k)) continue; var el=$(k); if(!el) continue;
      if(el.type==='checkbox') el.checked=!!o[k]; else el.value=o[k];
      if(el.tagName==='TEXTAREA') autoGrow(el);
    }
  }
  try{ hydrate(JSON.parse(localStorage.getItem(FORM_ID)||'{}')); }catch(e){}
  setInterval(function(){ try{ localStorage.setItem(FORM_ID, JSON.stringify(serialize())); }catch(e){} }, 5000);

  // Top controls
  $('btnSave').addEventListener('click', function(){ try{ localStorage.setItem(FORM_ID, JSON.stringify(serialize())); flash('Saved locally.'); }catch(e){} });
  $('btnLoad').addEventListener('click', function(){ try{ hydrate(JSON.parse(localStorage.getItem(FORM_ID)||'{}')); flash('Loaded from device.'); }catch(e){} });
  $('btnReset').addEventListener('click', function(){ if(confirm('Clear all fields?')){ try{ localStorage.removeItem(FORM_ID); }catch(e){} var inputs=document.querySelectorAll('input,textarea'); for(var i=0;i<inputs.length;i++){ if(inputs[i].type==='checkbox') inputs[i].checked=false; else inputs[i].value=''; } flash('Cleared.'); } });
  $('btnNight').addEventListener('click', function(){ document.body.classList.toggle('night'); try{ localStorage.setItem(FORM_ID+'_theme', document.body.classList.contains('night') ? 'night' : 'day'); }catch(e){} });
  $('btnNow').addEventListener('click', function(){ var loc=hhmmLocalNow(), zul=hhmmZulu(loc); $('brief_current_time').value=loc; $('brief_current_time_z').value=zul; $('brief_call_time').value=loc; $('brief_call_time_z').value=zul; flash('Top times set.'); });
  $('btnPrint').addEventListener('click', function(){ window.print(); });
  $('btnExport').addEventListener('click', function(){
    function val(id){ var el=$(id); return el?el.value:''; }
    var md = '# SAR Kneeboard (Typewriter)\\n\\n'+
      '## Ops Brief\\n'+
      'Time: '+val('brief_current_time')+'ZL / '+val('brief_current_time_z')+'Z\\n'+
      'Call: '+val('brief_call_time')+'ZL / '+val('brief_call_time_z')+'Z\\n'+
      'Loc: '+val('brief_location')+'\\n'+
      'Object: '+val('brief_search_object')+'\\n'+
      'Tasking: '+val('brief_tasking')+'\\n'+
      'Reporting: '+val('brief_reporting_source')+' | Others: '+val('brief_other_assets')+'\\n'+
      'Weather: '+val('brief_weather')+'\\n';
    var blob=new Blob([md],{type:'text/plain'});
    var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download='sar_kneeboard.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Weather helpers
  function setErr(id,msg){ var e=$(id); if(e) e.textContent=msg||''; }
  function insertWeatherLine(text){ var wx=$('brief_weather'); wx.value = text + (wx.value?'\n'+wx.value:''); autoGrow(wx); }
  function fetchJSON(url){ return fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }); }
  function fetchText(url){ return fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); }); }

  $('btnMetar').addEventListener('click', function onMetar(){
    setErr('metar_err','');
    var st=($('metar_station').value||'KSFO').toUpperCase();
    if(!/^[A-Z0-9]{3,4}$/.test(st)){ setErr('metar_err','Bad station code.'); return; }
    var adds='https://aviationweather.gov/adds/dataserver_current/httpparam?datasource=metars&requestType=retrieve&format=JSON&stationString='+st+'&hoursBeforeNow=2';
    fetchJSON(adds).then(function(d){
      var m=(d&&d.data&&d.data.METAR)||[];
      if(m.length){ insertWeatherLine(st+' METAR: '+(m[0].raw_text||'')); return; }
      throw new Error('No ADDS');
    }).catch(function(){
      var tg='https://tgftp.nws.noaa.gov/data/observations/metar/stations/'+st+'.TXT';
      fetchText(tg).then(function(t){
        var lines=t.split(/\r?\n/).filter(Boolean), raw=lines.pop()||'';
        if(raw){ insertWeatherLine(st+' METAR: '+raw); return; }
        throw new Error('No TGFTP');
      }).catch(function(){
        var mir='https://r.jina.ai/http://tgftp.nws.noaa.gov/data/observations/metar/stations/'+st+'.TXT';
        fetchText(mir).then(function(t2){
          var lines=t2.split(/\r?\n/).filter(Boolean), raw=lines.pop()||'';
          if(raw){ insertWeatherLine(st+' METAR: '+raw); return; }
          setErr('metar_err','METAR fetch failed.');
        }).catch(function(){ setErr('metar_err','METAR fetch failed.'); });
      });
    });
  });

  // Parse "3655.39N/12208.28W"
  function parseLatLonDM(s){
    if(!s) return null;
    s=s.trim().toUpperCase();
    var m=s.match(/^(\d{2})(\d{2}\.\d+)\s*([NS])\s*\/\s*(\d{3})(\d{2}\.\d+)\s*([EW])$/);
    if(!m) return null;
    var dlat=parseInt(m[1],10), mlat=parseFloat(m[2]), n=m[3];
    var dlon=parseInt(m[4],10), mlon=parseFloat(m[5]), e=m[6];
    var lat=(dlat+mlat/60)*(n==='S'?-1:1);
    var lon=(dlon+mlon/60)*(e==='W'?-1:1);
    return {lat:lat, lon:lon};
  }
  function ktsFromMps(mps){ return Math.round(mps*1.94384); }
  function miFromMeters(m){ return (m==null)?'':(m/1609.344).toFixed(1); }
  function fFromC(c){ return (c==null)?'':Math.round(c*9/5+32); }
  function ftFromMeters(m){ return (m==null)?'':Math.round(m*3.28084); }
  function inHgFromPa(pa){ if(pa==null) return ''; return (pa/3386.389).toFixed(2); }
  function lowestCeilingFt(cloudLayers){
    if(!cloudLayers||!cloudLayers.length) return ['',''];
    var best=null;
    for(var i=0;i<cloudLayers.length;i++){
      var layer=cloudLayers[i];
      var amt=layer.amount, base=layer.base&&layer.base.value;
      if(!base||!amt) continue;
      if(amt==='BKN'||amt==='OVC'){
        var ft=ftFromMeters(base);
        if(best===null||ft<best[1]) best=[amt,ft];
      }
    }
    return best||['',''];
  }
  function flightCategory(ceilFt, visMi){
    var v=parseFloat(visMi), c=parseFloat(ceilFt);
    if((c && c < 500) || (v && v < 1)) return 'LIFR';
    if((c && c < 1000) || (v && v < 3)) return 'IFR';
    if((c && c < 3000) || (v && v < 5)) return 'MVFR';
    return 'VFR';
  }
  function getJSONFallback(u1,u2){ return fetchJSON(u1).catch(function(){ return fetchJSON(u2); }); }

  $('btnPointAvi').addEventListener('click', function(){
    var s=$('brief_location').value, pt=parseLatLonDM(s);
    if(!pt){ setErr('onscene_err','Enter lat/long like 3655.39N/12208.28W'); return; }
    setErr('onscene_err',''); var src=$('onscene_src'); if(src) src.textContent='';
    getJSONFallback('https://api.weather.gov/points/'+pt.lat+','+pt.lon,'https://r.jina.ai/http://api.weather.gov/points/'+pt.lat+','+pt.lon)
    .then(function(points){
      var props=points&&points.properties; if(!props) throw new Error('no props');
      return fetchJSON(props.observationStations).catch(function(){
        return fetchJSON('https://r.jina.ai/http://api.weather.gov/gridpoints/'+props.gridId+'/'+props.gridX+','+props.gridY+'/stations');
      }).then(function(sts){ return {props:props, sts:sts}; });
    }).then(function(ctx){
      var stId=null; try{ stId=ctx.sts.features[0].properties.stationIdentifier; }catch(e){}
      if(!stId) throw new Error('no station');
      return fetchJSON('https://api.weather.gov/stations/'+stId+'/observations/latest')
        .catch(function(){ return fetchJSON('https://r.jina.ai/http://api.weather.gov/stations/'+stId+'/observations/latest'); })
        .then(function(obs){ return {stId:stId, obs:obs}; });
    }).then(function(pkg){
      var p=pkg.obs&&pkg.obs.properties; if(!p) throw new Error('no obs');
      var windKt=p.windSpeed&&p.windSpeed.value!=null?ktsFromMps(p.windSpeed.value):'';
      var windDir=p.windDirection&&p.windDirection.value!=null?Math.round(p.windDirection.value):null;
      var visMi=p.visibility&&p.visibility.value!=null?miFromMeters(p.visibility.value):'';
      var tempF=p.temperature&&p.temperature.value!=null?fFromC(p.temperature.value):'';
      var altIn=inHgFromPa(p.barometricPressure&&p.barometricPressure.value);
      var ceil=lowestCeilingFt(p.cloudLayers||[]);
      var cat=flightCategory(ceil[1], visMi);
      if($('os_wind')) $('os_wind').value=(windKt?windKt+' kt ':'')+(windDir!=null?windDir+'°':'');
      if($('os_vis')) $('os_vis').value=visMi?visMi+' mi':'';
      if($('os_airtemp')) $('os_airtemp').value=tempF?tempF+'°F':'';
      if($('os_ceiling')) $('os_ceiling').value=ceil[1]?ceil[1]+' ft '+ceil[0]:'';
      if($('onscene_src')) $('onscene_src').textContent='Obs station '+pkg.stId;
      var ll = (pt.lat.toFixed?pt.lat.toFixed(3):pt.lat)+','+(pt.lon.toFixed?pt.lon.toFixed(3):pt.lon);
      var parts=[];
      if(windDir!=null||windKt) parts.push('Winds '+(windDir!=null?windDir+'°/':'')+(windKt||'')+'kt');
      if(visMi) parts.push('Vis '+visMi+'sm');
      if(ceil[1]) parts.push('Ceil '+ceil[1]+' ft '+ceil[0]);
      if(tempF!=='') parts.push('Temp '+tempF+'F');
      if(altIn) parts.push('Alt '+altIn+'inHg');
      parts.push('Cat '+cat);
      insertWeatherLine('Point Wx '+ll+': '+parts.join(', '));
    }).catch(function(){ setErr('onscene_err','Point lookup failed.'); });
  });

  $('btnOnScene').addEventListener('click', function(){
    var s=$('brief_location').value, pt=parseLatLonDM(s);
    if(!pt){ setErr('onscene_err','Enter lat/long like 3655.39N/12208.28W'); return; }
    setErr('onscene_err',''); var src=$('onscene_src'); if(src) src.textContent='';
    var p1='https://api.weather.gov/points/'+pt.lat+','+pt.lon, p2='https://r.jina.ai/http://api.weather.gov/points/'+pt.lat+','+pt.lon;
    fetchJSON(p1).catch(function(){ return fetchJSON(p2); }).then(function(points){
      var props=points&&points.properties; if(!props) throw new Error('no props');
      return fetchJSON(props.observationStations).catch(function(){
        return fetchJSON('https://r.jina.ai/http://api.weather.gov/gridpoints/'+props.gridId+'/'+props.gridX+','+props.gridY+'/stations');
      }).then(function(sts){ return {props:props, sts:sts}; });
    }).then(function(ctx){
      var stId=null; try{ stId=ctx.sts.features[0].properties.stationIdentifier; }catch(e){}
      if(!stId) throw new Error('no station');
      return fetchJSON('https://api.weather.gov/stations/'+stId+'/observations/latest')
        .catch(function(){ return fetchJSON('https://r.jina.ai/http://api.weather.gov/stations/'+stId+'/observations/latest'); });
    }).then(function(latest){
      var p=latest&&latest.properties; if(!p) throw new Error('no obs');
      var windKt=p.windSpeed&&p.windSpeed.value!=null?Math.round(p.windSpeed.value*1.94384):'';
      var windDir=p.windDirection&&p.windDirection.value!=null?Math.round(p.windDirection.value):null;
      var vis=p.visibility&&p.visibility.value!=null?(p.visibility.value/1609.344).toFixed(1):'';
      var temp=p.temperature&&p.temperature.value!=null?Math.round(p.temperature.value*9/5+32):'';
      if($('os_wind')) $('os_wind').value=(windKt?windKt+' kt ':'')+(windDir!=null?windDir+'°':'');
      if($('os_vis')) $('os_vis').value=vis?vis+' mi':'';
      if($('os_airtemp')) $('os_airtemp').value=temp?temp+'°F':'';
      if(src) src.textContent='Obs: station set';
      flash('On‑scene weather updated.');
    }).catch(function(){ setErr('onscene_err','On‑scene lookup failed.'); });
  });

  $('btnGPS').addEventListener('click', function(){
    if(!navigator.geolocation){ setErr('onscene_err','Geolocation not available.'); return; }
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat=pos.coords.latitude, lon=pos.coords.longitude;
      function toDMM(value, isLat){
        var hem = isLat ? (value>=0?'N':'S') : (value>=0?'E':'W');
        var abs=Math.abs(value); var d=Math.floor(abs); var m=(abs-d)*60;
        return (isLat?String(d).padStart(2,'0'):String(d).padStart(3,'0')) + m.toFixed(2).padStart(5,'0') + hem;
      }
      $('brief_location').value = toDMM(lat,true)+'/'+toDMM(lon,false);
    }, function(){ setErr('onscene_err','GPS denied.'); }, {enableHighAccuracy:true, timeout:8000, maximumAge:0});
  });

  // Fuel calculator (fixed rates)
  var FC_CRUISE = 600; // per hour
  var FC_HOVER  = 700; // per hour
  function fc_num(id){ var v = ($(id).value||'').trim().replace(/,/g,''); return v? Number(v) : NaN; }
  function fc_fmtH(hours){ if(!isFinite(hours)) return '--:--'; var m=Math.max(0, Math.round(hours*60)); var h=Math.floor(m/60), mm=m%60; return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }
  function fc_calc(){
    var start=fc_num('fc_start'), weight=fc_num('fc_weight'), end=fc_num('fc_end');
    var dist=fc_num('fc_dist'), tas=fc_num('fc_tas'), back=fc_num('fc_dist_back');
    var out=$('fc_out');
    if([start,weight,end,dist,tas,back].some(function(x){return !isFinite(x) || x<0;}) || tas===0){
      out.innerHTML='<div class="err">Check inputs. All non‑negative; speed > 0.</div>'; return;
    }
    if(weight < start){
      out.innerHTML='<div class="err">Takeoff weight must be at least as large as takeoff fuel.</div>';
      return;
    }
    var t_out = dist/tas; var f_out = FC_CRUISE*t_out; var fuel_on_scene = start - f_out;
    var t_back = back/tas; var f_back = FC_CRUISE*t_back; var bingo = end + f_back;
    var f_avail = fuel_on_scene - bingo; var t_hover = f_avail/ FC_HOVER;
    var good = t_hover >= 0;
    var badge = good ? '<span class="badge">GOOD</span>' : '<span class="badge bad">SHORT</span>';
    var short_text = good ? '' : ('Short by <b>'+Math.abs(f_avail).toFixed(0)+'</b> units at on‑scene.');
    var zfw = weight - start;
    var weight_on_scene = zfw + fuel_on_scene;
    var weight_bingo = zfw + bingo;
    var weight_landing = zfw + end;
    var hover_ok = weight_on_scene <= 9200;
    var hover_badge = hover_ok ? '<span class="badge">GOOD</span>' : '<span class="badge bad">BAD</span>';
    var hover_note = hover_ok ? '' : ' (over 9200)';
    out.innerHTML = ''
      + '<div><b>Outbound:</b> Time '+fc_fmtH(t_out)+' • Fuel '+f_out.toFixed(0)+' • Weight '+weight_on_scene.toFixed(0)+'</div>'
      + '<div><b>Fuel on Scene:</b> '+fuel_on_scene.toFixed(0)+' • Weight '+weight_on_scene.toFixed(0)+'</div>'
      + '<div class="mini">(Takeoff '+start.toFixed(0)+' − Outbound '+f_out.toFixed(0)+')</div>'
      + '<div style="border-top:1px dashed #c9bb98; margin-top:8px; padding-top:8px"><b>On‑Scene Fuel Available:</b> '+Math.max(0,f_avail).toFixed(0)+' '+badge+'</div>'
      + '<div><b>On‑Scene Time (hover):</b> '+fc_fmtH(t_hover)+' at '+FC_HOVER.toFixed(0)+'/hr • Weight '+weight_on_scene.toFixed(0)+' '+hover_badge+hover_note+'</div>'
      + (short_text?'<div>'+short_text+'</div>':'')
      + '<div><b>Planned Landing Fuel:</b> '+end.toFixed(0)+' • Landing Weight '+weight_landing.toFixed(0)+'</div>'
      + '<div style="border-top:1px dashed #c9bb98; margin-top:8px; padding-top:8px"><b>Return (Bingo):</b> Time '+fc_fmtH(t_back)+' • Transit Fuel '+f_back.toFixed(0)+' • <b>Bingo</b> '+bingo.toFixed(0)+' • Weight '+weight_bingo.toFixed(0)+'</div>';
  }
  function fc_clear(){ ['fc_start','fc_weight','fc_end','fc_dist','fc_tas','fc_dist_back'].forEach(function(id){ $(id).value=''; }); $('fc_out').innerHTML=''; }
  $('fc_btn_calc').addEventListener('click', fc_calc);
  $('fc_btn_clear').addEventListener('click', fc_clear);
})();