import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Icons ─────────────────────────────────────────────────────────────────────
const makePin = (color, label) => L.divIcon({
  className:'',
  html:`<div style="width:34px;height:42px;position:relative">
    <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,0.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);font-size:11px;font-weight:800;color:#fff;font-family:'Plus Jakarta Sans',sans-serif">${label}</span>
    </div></div>`,
  iconSize:[34,42],iconAnchor:[17,42],popupAnchor:[0,-44]
});

const makeLandmark = (name) => L.divIcon({
  className:'',
  html:`<div style="background:rgba(255,255,255,0.95);border:1px solid #E5E7EB;border-radius:6px;padding:2px 6px;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;color:'#374151';box-shadow:0 2px 4px rgba(0,0,0,0.1);white-space:nowrap;pointer-events:none;">
    📍 ${name}
  </div>`,
  iconSize:[0,0],iconAnchor:[-6, 8]
});

const waterIcon = L.divIcon({
  className:'',
  html:`<div style="width:24px;height:24px;border-radius:50%;background:#06B6D4;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:12px">💧</div>`,
  iconSize:[24,24],iconAnchor:[12,12],popupAnchor:[0,-14]
});

const makeWifiIcon = (type) => L.divIcon({
  className:'',
  html:`<div style="width:20px;height:20px;border-radius:50%;background:${type==='main'?'#1D4ED8':'#D97706'};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M1 9l2 2c5.5-5.5 14.5-5.5 20 0l2-2C18.5 2.5 6.5 2.5 1 9zm8 8l3 3 3-3c-1.7-1.6-4.3-1.6-6 0zm-4-4l2 2c2.8-2.7 7.2-2.7 10 0l2-2C15.1 9.3 9.9 9.3 5 13z"/></svg>
  </div>`,
  iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-14]
});

const signalColor = (s) => s>=70?'#16A34A':s>=40?'#CA8A04':s>=15?'#EA580C':'#DC2626';
const signalLabel = (s) => s>=70?'Strong':s>=40?'Good':s>=15?'Weak':'No signal';

// ── Map Fixes ─────────────────────────────────────────────────────────────────
function FlyTo({center,zoom}){
  const map=useMap();
  useEffect(()=>{ map.flyTo(center,zoom,{animate:true,duration:2.0,easeLinearity:0.25}); },[center[0],center[1],zoom]); // eslint-disable-line
  return null;
}
function MapFix() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 250); }, [map]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LeafletMap({college,buildings,route,selected,wifiAPs=[],waterNodes=[]}) {
  if(!college) return(
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#E8F4FD'}}>
      <p style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,color:'#64748B',fontSize:14}}>Select a campus to load the map</p>
    </div>
  );

  const pathCoords=(route?.pathDetails||[]).map(b=>[b.lat,b.lng]);
  const signalPts=route?.signalPoints||[];

  return(
    <div style={{position:'relative',height:'100%'}}>
      <MapContainer center={[20.5,78.9]} zoom={5} style={{height:'100%',width:'100%'}} zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20} crossOrigin={true}
        />
        <MapFix />
        <FlyTo center={college.center} zoom={college.zoom}/>

        {/* Landmarks (All Buildings) */}
        {buildings.map(b=>(
          <Marker key={`lm-${b.id}`} position={[b.lat,b.lng]} icon={makeLandmark(b.name)} />
        ))}

        {/* Water Sources */}
        {waterNodes.map((w, i)=>(
          <Marker key={`w-${i}`} position={[w.lat,w.lng]} icon={waterIcon}>
            <Popup><div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:12,color:'#0891B2'}}>💧 Drinking Water<br/><span style={{fontWeight:500,color:'#374151'}}>{w.name}</span></div></Popup>
          </Marker>
        ))}

        {/* WiFi APs */}
        {wifiAPs.map(ap=>(
          <Marker key={ap.id} position={[ap.lat,ap.lng]} icon={makeWifiIcon(ap.type)}>
            <Popup>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",minWidth:140}}>
                <p style={{fontWeight:700,fontSize:12,color:ap.type==='main'?'#1D4ED8':'#B45309',marginBottom:3}}>{ap.type==='main'?'Campus WiFi':'Open WiFi'}</p>
                <p style={{fontSize:13,fontWeight:500}}>{ap.name}</p>
              </div>
            </Popup>
            <Circle center={[ap.lat,ap.lng]} radius={ap.type==='main'?120:80} pathOptions={{color:ap.type==='main'?'#3B82F6':'#F59E0B',fillColor:ap.type==='main'?'#BFDBFE':'#FDE68A',fillOpacity:0.08,weight:1,dashArray:'4 4'}} />
          </Marker>
        ))}

        {/* Route Signal Dots */}
        {signalPts.map((pt,i)=>(
          <Marker key={`sig-${i}`} position={[pt.lat,pt.lng]} icon={L.divIcon({
            className:'',
            html:`<div style="width:10px;height:10px;border-radius:50%;background:${signalColor(pt.strength)};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
            iconSize:[10,10],iconAnchor:[5,5]
          })} />
        ))}

        {/* Start A */}
        {selected.from&&(()=>{
          const b=buildings.find(x=>x.id===selected.from);
          return b?(<Marker position={[b.lat,b.lng]} icon={makePin('#0052CC','A')} />):null;
        })()}

        {/* End B */}
        {selected.to&&(()=>{
          const b=buildings.find(x=>x.id===selected.to);
          return b?(<Marker position={[b.lat,b.lng]} icon={makePin('#FF6B35','B')} />):null;
        })()}

        {/* Walking Trail (Dotted, mimics paths) */}
        {(route?.osrmGeometry || pathCoords).length>=2&&(
          <>
            <Polyline positions={route?.osrmGeometry || pathCoords} color="#000" weight={8} opacity={0.15}/>
            {/* Trail effect instead of rigid road line */}
            <Polyline positions={route?.osrmGeometry || pathCoords} color="#0052CC" weight={5} opacity={0.9} dashArray="1 10" lineCap="round" lineJoin="round" />
            <Polyline positions={route?.osrmGeometry || pathCoords} color="#3B82F6" weight={3} opacity={0.6} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
