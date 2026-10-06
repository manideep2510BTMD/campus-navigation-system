const express = require('express');
const {dijkstra} = require('../algorithms/dijkstra');
const {campuses,haversine,bearing,maneuver,buildGraph,interpolatePath,signalAt,CARDINAL} = require('../data/campus');
const router = express.Router();

/** GET /api/nav/colleges */
router.get('/colleges',(req,res)=>{
  const list=Object.entries(campuses).map(([id,c])=>({id,name:c.name,city:c.city,center:c.center,zoom:c.zoom,buildings:c.buildings,wifi:c.wifi}));
  res.json({colleges:list});
});

/** POST /api/nav/route  body:{college,from,to} */
router.post('/route',(req,res)=>{
  const {college:cid,from,to}=req.body;
  if(!cid||!from||!to) return res.status(400).json({error:'college, from, to required'});
  if(from===to) return res.status(400).json({error:'Start and destination must differ'});
  const campus=campuses[cid];
  if(!campus) return res.status(404).json({error:'College not found'});
  const {buildings,wifi=[]}=campus;
  const ids=new Set(buildings.map(b=>b.id));
  if(!ids.has(from)||!ids.has(to)) return res.status(400).json({error:'Invalid building ID'});

  const graph=buildGraph(buildings,5);
  const result=dijkstra(graph,from,to);
  if(!result) return res.status(404).json({error:'No path found'});

  const pathDetails=result.path.map(id=>buildings.find(b=>b.id===id));
  const distM=Math.round(result.distance);

  // Turn-by-turn from bearing changes
  const steps=[];
  for(let i=0;i<pathDetails.length;i++){
    const cur=pathDetails[i],next=pathDetails[i+1],prev=pathDetails[i-1];
    if(i===0){
      const initB=bearing(cur.lat,cur.lng,next.lat,next.lng);
      const card=CARDINAL[Math.round(initB/45)%8];
      const seg=Math.round(haversine(cur.lat,cur.lng,next.lat,next.lng));
      steps.push({type:'depart',modifier:'straight',instruction:`Head ${card} from ${cur.name}`,toward:next.name,distance:seg,distanceText:seg>=1000?`${(seg/1000).toFixed(1)} km`:`${seg} m`,location:[cur.lng,cur.lat]});
    } else if(i===pathDetails.length-1){
      steps.push({type:'arrive',modifier:null,instruction:`Arrive at ${cur.name}`,toward:null,distance:0,distanceText:'0 m',location:[cur.lng,cur.lat]});
    } else {
      const b1=bearing(prev.lat,prev.lng,cur.lat,cur.lng);
      const b2=bearing(cur.lat,cur.lng,next.lat,next.lng);
      const m=maneuver(b1,b2);
      const seg=Math.round(haversine(cur.lat,cur.lng,next.lat,next.lng));
      steps.push({type:m.type,modifier:m.modifier,instruction:`${m.text} at ${cur.name}`,toward:next.name,distance:seg,distanceText:seg>=1000?`${(seg/1000).toFixed(1)} km`:`${seg} m`,location:[cur.lng,cur.lat]});
    }
  }

  // Signal strength points every 150m
  const signalPoints=interpolatePath(pathDetails,150).map(pt=>({
    lat:pt.lat,lng:pt.lng,
    strength:signalAt(pt.lat,pt.lng,wifi)
  }));

  const durationSec=Math.round(distM/1.4);
  const durationMins=Math.floor(durationSec/60);
  const durationSecs=durationSec%60;
  const durationText=durationMins>0?`${durationMins} min${durationSecs>0?' '+durationSecs+'s':''}`:durationSec+'s';

  res.json({
    algorithm:"Dijkstra Shortest Path (Haversine)",
    path:result.path,pathDetails,
    distance:distM,
    distanceText:distM>=1000?`${(distM/1000).toFixed(2)} km`:`${distM} m`,
    durationSec,durationText,
    steps,signalPoints,
    wifi: wifi // return wifi APs for map display
  });
});

module.exports=router;
