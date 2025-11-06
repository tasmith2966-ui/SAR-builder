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
  ['req','to','csp','tgt','ohd','ds','sd'].forEach(function(tag){
    attachSync('evt_'+tag+'_time_local','evt_'+tag+'_time_z');
  });

  // Save/Load
  function serialize(){
    var ids=[
      'brief_current_time','brief_current_time_z','brief_call_time','brief_call_time_z',
      'brief_location','brief_tasking','brief_reporting_source','brief_other_assets',
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
      'Case Details: '+val('brief_tasking')+'\\n'+
      'Reporting: '+val('brief_reporting_source')+' | Others: '+val('brief_other_assets')+'\\n'+
      'Weather: '+val('brief_weather')+'\\n';
    var blob=new Blob([md],{type:'text/plain'});
    var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download='sar_kneeboard.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Weather helpers
  function setErr(id,msg){ var e=$(id); if(e) e.textContent=msg||''; }
  function insertWeatherLine(text){
    var wx=$('brief_weather'); if(!wx) return;
    wx.value = '• '+text + (wx.value?'\n\n'+wx.value:'');
    autoGrow(wx);
  }
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

  function distanceNm(lat1,lon1,lat2,lon2){
    var toRad=Math.PI/180;
    var dLat=(lat2-lat1)*toRad;
    var dLon=(lon2-lon1)*toRad;
    var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*toRad)*Math.cos(lat2*toRad)*Math.sin(dLon/2)*Math.sin(dLon/2);
    var c=2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return 3440.065*c;
  }
  function normalizeStationList(raw){
    var list=raw;
    if(raw && Array.isArray(raw.station)) list=raw.station;
    else if(raw && Array.isArray(raw.stations)) list=raw.stations;
    if(!Array.isArray(list)) return [];
    var out=[];
    for(var i=0;i<list.length;i++){
      var entry=list[i];
      var id=null, lat=null, lon=null, type='', name='';
      if(Array.isArray(entry)){
        id=entry[0]; lat=parseFloat(entry[1]); lon=parseFloat(entry[2]); type=entry[3]||''; name=entry[4]||'';
      }else if(entry && typeof entry==='object'){
        id=entry.id||entry.station_id||entry[0];
        lat=parseFloat(entry.lat||entry.latitude||entry[1]);
        lon=parseFloat(entry.lon||entry.longitude||entry[2]);
        type=entry.type||entry.kind||entry.t||'';
        name=entry.name||entry.title||entry.desc||'';
      }
      if(!id || !isFinite(lat) || !isFinite(lon)) continue;
      out.push({id:String(id).trim(), lat:lat, lon:lon, type:String(type||'').toLowerCase(), name:String(name||'')});
    }
    return out;
  }
  function parseRealtime(text){
    if(!text) return null;
    var lines=text.split(/\r?\n/);
    var header=null;
    for(var i=0;i<lines.length;i++){
      var line=lines[i].trim();
      if(!line) continue;
      if(line.charAt(0)==='#'){
        if(!header){
          var maybe=line.replace(/^#+\s*/,'').trim();
          if(maybe) header=maybe.split(/\s+/);
        }
        continue;
      }
      if(!header) continue;
      var parts=line.split(/\s+/);
      if(parts.length<header.length) continue;
      var rec={};
      for(var j=0;j<header.length && j<parts.length;j++){ rec[header[j]]=parts[j]; }
      return rec;
    }
    return null;
  }
  function metersToFeet(value){
    var v=parseFloat(value);
    if(!isFinite(v)) return null;
    return v*3.28084;
  }
  function fetchBuoyObservation(stationId){
    var url='https://www.ndbc.noaa.gov/data/realtime2/'+stationId+'.txt';
    var fallback='https://r.jina.ai/http://www.ndbc.noaa.gov/data/realtime2/'+stationId+'.txt';
    return fetchText(url).catch(function(){ return fetchText(fallback); }).then(function(text){
      var rec=parseRealtime(text);
      if(!rec) throw new Error('no data');
      return rec;
    });
  }
  function fetchNearestBuoy(pt){
    var url='https://www.ndbc.noaa.gov/ndbcmapstations.json';
    var fallback='https://r.jina.ai/http://www.ndbc.noaa.gov/ndbcmapstations.json';
    return fetchJSON(url).catch(function(){ return fetchJSON(fallback); }).then(function(raw){
      var stations=normalizeStationList(raw);
      if(!stations.length) throw new Error('no stations');
      var pool=stations.filter(function(st){ return st.type.indexOf('buoy')!==-1 || st.type.indexOf('dart')!==-1; });
      if(!pool.length) pool=stations;
      var best=null;
      for(var i=0;i<pool.length;i++){
        var st=pool[i];
        var dist=distanceNm(pt.lat, pt.lon, st.lat, st.lon);
        if(!isFinite(dist)) continue;
        if(!best || dist<best.distance){ best={station:st, distance:dist}; }
      }
      if(!best) throw new Error('no station');
      return fetchBuoyObservation(best.station.id).then(function(rec){
        return {station:best.station, distanceNm:best.distance, record:rec};
      });
    });
  }
  function buoySeaState(record){
    if(!record) return {seas:'', swells:''};
    var seas='';
    var wvht=metersToFeet(record.WVHT);
    if(wvht!=null){
      seas=wvht.toFixed(1)+' ft';
      var dpd=parseFloat(record.DPD);
      if(isFinite(dpd)) seas+=' @ '+Math.round(dpd)+'s';
      var mwd=parseFloat(record.MWD);
      if(isFinite(mwd)) seas+=' '+Math.round(mwd)+'°';
    }
    var swells='';
    var swh=metersToFeet(record.SwH);
    if(swh!=null){
      swells=swh.toFixed(1)+' ft';
      var swp=parseFloat(record.SwP);
      if(isFinite(swp)) swells+=' @ '+Math.round(swp)+'s';
      var swd=parseFloat(record.SwD);
      if(isFinite(swd)) swells+=' '+Math.round(swd)+'°';
      else if(record.SwD && /^[A-Z]{1,3}$/.test(record.SwD)) swells+=' '+record.SwD;
    }
    return {seas:seas, swells:swells};
  }
  function fetchPointObservation(pt){
    return getJSONFallback('https://api.weather.gov/points/'+pt.lat+','+pt.lon,'https://r.jina.ai/http://api.weather.gov/points/'+pt.lat+','+pt.lon)
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
      var windKt=p.windSpeed&&p.windSpeed.value!=null?Math.round(p.windSpeed.value*1.94384):'';
      var windDir=p.windDirection&&p.windDirection.value!=null?Math.round(p.windDirection.value):null;
      var visMi=p.visibility&&p.visibility.value!=null?(p.visibility.value/1609.344).toFixed(1):'';
      var tempF=p.temperature&&p.temperature.value!=null?Math.round(p.temperature.value*9/5+32):'';
      var altIn=inHgFromPa(p.barometricPressure&&p.barometricPressure.value);
      var ceil=lowestCeilingFt(p.cloudLayers||[]);
      var cat=flightCategory(ceil[1], visMi);
      var ll=(pt.lat.toFixed?pt.lat.toFixed(3):pt.lat)+','+(pt.lon.toFixed?pt.lon.toFixed(3):pt.lon);
      return {
        stationId:pkg.stId,
        windKt:windKt,
        windDir:windDir,
        visMi:visMi,
        tempF:tempF,
        altimeter:altIn,
        ceilingFt:ceil[1],
        ceilingAmount:ceil[0],
        category:cat,
        latlon:ll
      };
    });
  }

  $('btnPointAvi').addEventListener('click', function(){
    var s=$('brief_location').value, pt=parseLatLonDM(s);
    if(!pt){ setErr('onscene_err','Enter lat/long like 3655.39N/12208.28W'); return; }
    setErr('onscene_err',''); var src=$('onscene_src'); if(src) src.textContent='';
    fetchPointObservation(pt).then(function(obs){
      if($('os_wind')) $('os_wind').value=(obs.windKt?obs.windKt+' kt ':'')+(obs.windDir!=null?obs.windDir+'°':'');
      if($('os_vis')) $('os_vis').value=obs.visMi?obs.visMi+' mi':'';
      if($('os_airtemp')) $('os_airtemp').value=obs.tempF?obs.tempF+'°F':'';
      if($('os_ceiling')) $('os_ceiling').value=obs.ceilingFt?obs.ceilingFt+' ft '+obs.ceilingAmount:'';
      if(src) src.textContent=obs.stationId?'Obs station '+obs.stationId:'';
      var parts=[];
      if(obs.windDir!=null || obs.windKt!==''){
        var w='Winds ';
        if(obs.windDir!=null) w+=obs.windDir+'°';
        if(obs.windDir!=null && obs.windKt!=='') w+='/';
        if(obs.windKt!=='') w+=obs.windKt+'kt';
        parts.push(w.trim());
      }
      if(obs.visMi) parts.push('Vis '+obs.visMi+'sm');
      if(obs.ceilingFt) parts.push('Ceil '+obs.ceilingFt+' ft '+obs.ceilingAmount);
      if(obs.tempF!=='') parts.push('Temp '+obs.tempF+'F');
      if(obs.altimeter) parts.push('Alt '+obs.altimeter+'inHg');
      parts.push('Cat '+obs.category);
      insertWeatherLine('Point Wx '+obs.latlon+': '+parts.join(', '));
    }).catch(function(){ setErr('onscene_err','Point lookup failed.'); });
  });

  $('btnOnScene').addEventListener('click', function(){
    var s=$('brief_location').value, pt=parseLatLonDM(s);
    if(!pt){ setErr('onscene_err','Enter lat/long like 3655.39N/12208.28W'); return; }
    setErr('onscene_err','');
    var src=$('onscene_src'); if(src) src.textContent='';
    if($('os_seas')) $('os_seas').value='';
    if($('os_swells')) $('os_swells').value='';
    var obsPromise=fetchPointObservation(pt);
    var buoyPromise=fetchNearestBuoy(pt).catch(function(){ return null; });
    Promise.all([obsPromise, buoyPromise]).then(function(results){
      var obs=results[0], buoy=results[1];
      if(!obs) throw new Error('no obs');
      if($('os_wind')) $('os_wind').value=(obs.windKt?obs.windKt+' kt ':'')+(obs.windDir!=null?obs.windDir+'°':'');
      if($('os_vis')) $('os_vis').value=obs.visMi?obs.visMi+' mi':'';
      if($('os_airtemp')) $('os_airtemp').value=obs.tempF?obs.tempF+'°F':'';
      if($('os_ceiling')) $('os_ceiling').value=obs.ceilingFt?obs.ceilingFt+' ft '+obs.ceilingAmount:'';
      var notes=[];
      if(obs.stationId) notes.push('Obs station '+obs.stationId);
      if(buoy && buoy.record){
        var seas=buoySeaState(buoy.record);
        if($('os_seas')) $('os_seas').value=seas.seas||'';
        if($('os_swells')) $('os_swells').value=seas.swells||'';
        var label='Buoy '+buoy.station.id;
        if(buoy.station.name) label+=' '+buoy.station.name;
        if(isFinite(buoy.distanceNm)) label+=' (~'+Math.round(buoy.distanceNm)+' nm)';
        notes.push('Seas '+label.trim());
      }
      if(src) src.textContent=notes.join(' • ');
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
    var fuel_ok = t_hover >= 0;
    var fuel_badge = fuel_ok ? '<span class="badge">GOOD</span>' : '<span class="badge bad">SHORT</span>';
    var short_text = fuel_ok ? '' : ('Short by <b>'+Math.abs(f_avail).toFixed(0)+'</b> units at on‑scene.');
    var zfw = weight - start;
    var weight_on_scene = zfw + fuel_on_scene;
    var weight_bingo = zfw + bingo;
    var weight_landing = zfw + end;
    var weight_ok = weight_on_scene <= 9200;
    var weight_badge = weight_ok ? '<span class="badge">GOOD</span>' : '<span class="badge bad">BAD</span>';
    var weight_note = weight_ok ? '' : ' (over 9200)';
    var sections=[];
    sections.push('<div style="margin-bottom:10px"><b>Outbound</b><div>Time '+fc_fmtH(t_out)+' • Fuel Used '+f_out.toFixed(0)+'</div></div>');
    var onScene='<div style="border-top:1px dashed #c9bb98; padding-top:8px; margin-top:8px"><b>On‑Scene</b>'+
      '<div>Fuel on Scene '+fuel_on_scene.toFixed(0)+'</div>'+
      '<div class="mini">(Takeoff '+start.toFixed(0)+' − Outbound '+f_out.toFixed(0)+')</div>'+
      '<div>Fuel Available '+Math.max(0,f_avail).toFixed(0)+' '+fuel_badge+'</div>'+
      '<div>Hover Time '+fc_fmtH(t_hover)+' at '+FC_HOVER.toFixed(0)+'/hr</div>'+
      '<div>On‑Scene Weight '+weight_on_scene.toFixed(0)+' '+weight_badge+weight_note+'</div>'+
      (short_text?'<div>'+short_text+'</div>':'')+
      '</div>';
    sections.push(onScene);
    sections.push('<div style="border-top:1px dashed #c9bb98; padding-top:8px; margin-top:8px"><b>Inbound</b><div>Time '+fc_fmtH(t_back)+' • Transit Fuel '+f_back.toFixed(0)+'</div><div>Bingo '+bingo.toFixed(0)+' • Return Weight '+weight_bingo.toFixed(0)+'</div></div>');
    sections.push('<div style="border-top:1px dashed #c9bb98; padding-top:8px; margin-top:8px"><b>Landing</b><div>Planned Fuel '+end.toFixed(0)+' • Landing Weight '+weight_landing.toFixed(0)+'</div></div>');
    out.innerHTML = sections.join('');
  }
  function fc_clear(){ ['fc_start','fc_weight','fc_end','fc_dist','fc_tas','fc_dist_back'].forEach(function(id){ $(id).value=''; }); $('fc_out').innerHTML=''; }
  $('fc_btn_calc').addEventListener('click', fc_calc);
  $('fc_btn_clear').addEventListener('click', fc_clear);
})();