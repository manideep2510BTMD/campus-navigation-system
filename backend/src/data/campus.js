/**
 * Campus buildings + WiFi APs — real GPS coordinates
 * Haversine distances used throughout
 */

function haversine(lat1,lng1,lat2,lng2){const R=6371000,p=Math.PI/180;const a=0.5-Math.cos((lat2-lat1)*p)/2+Math.cos(lat1*p)*Math.cos(lat2*p)*(1-Math.cos((lng2-lng1)*p))/2;return R*2*Math.asin(Math.sqrt(a));}
function bearing(lat1,lng1,lat2,lng2){const p=Math.PI/180,dL=(lng2-lng1)*p,y=Math.sin(dL)*Math.cos(lat2*p),x=Math.cos(lat1*p)*Math.sin(lat2*p)-Math.sin(lat1*p)*Math.cos(lat2*p)*Math.cos(dL);return(Math.atan2(y,x)/p+360)%360;}
function maneuver(b1,b2){const d=((b2-b1)+360)%360;if(d<22.5||d>337.5)return{type:'continue',modifier:'straight',text:'Continue straight'};if(d<67.5)return{type:'turn',modifier:'slight right',text:'Turn slight right'};if(d<112.5)return{type:'turn',modifier:'right',text:'Turn right'};if(d<157.5)return{type:'turn',modifier:'sharp right',text:'Turn sharp right'};if(d<202.5)return{type:'uturn',modifier:'uturn',text:'Make a U-turn'};if(d<247.5)return{type:'turn',modifier:'sharp left',text:'Turn sharp left'};if(d<292.5)return{type:'turn',modifier:'left',text:'Turn left'};return{type:'turn',modifier:'slight left',text:'Turn slight left'};}
const CARDINAL=['North','Northeast','East','Southeast','South','Southwest','West','Northwest'];

function buildGraph(buildings,K=5){const graph={};buildings.forEach(b=>{graph[b.id]=[];});buildings.forEach(b=>{const dists=buildings.filter(o=>o.id!==b.id).map(o=>({id:o.id,d:haversine(b.lat,b.lng,o.lat,o.lng)})).sort((a,c)=>a.d-c.d).slice(0,K);dists.forEach(({id,d})=>{if(!graph[b.id].find(e=>e.node===id))graph[b.id].push({node:id,weight:d});if(!graph[id].find(e=>e.node===b.id))graph[id].push({node:b.id,weight:d});});});return graph;}

// Interpolate points every `interval` meters along a path of {lat,lng}
function interpolatePath(nodes, interval=150){
  const pts=[];
  let rem=0;
  for(let i=0;i<nodes.length-1;i++){
    const a=nodes[i],b=nodes[i+1];
    const segD=haversine(a.lat,a.lng,b.lat,b.lng);
    let d=rem;
    while(d<=segD){const t=d/segD;pts.push({lat:a.lat+t*(b.lat-a.lat),lng:a.lng+t*(b.lng-a.lng)});d+=interval;}
    rem=d-segD;
  }
  return pts;
}

// Signal strength 0-100 at point based on nearest WiFi AP
function signalAt(lat,lng,wifiAPs){
  let best=0;
  wifiAPs.forEach(ap=>{
    const d=haversine(lat,lng,ap.lat,ap.lng);
    const range=ap.type==='main'?120:80;
    const s=Math.max(0,Math.round((1-d/range)*100));
    if(s>best)best=s;
  });
  return best;
}

const campuses = {
  iit_bombay:{
    name:'IIT Bombay',city:'Mumbai',center:[19.1334,72.9133],zoom:16,
    buildings:[
      {id:'main_gate',  name:'Main Gate',                 lat:19.1327,lng:72.9133},
      {id:'nalanda',    name:'Nalanda Library',            lat:19.1291,lng:72.9148},
      {id:'lhc',        name:'Lecture Hall Complex',       lat:19.1341,lng:72.9140},
      {id:'sac',        name:'Student Activity Centre',    lat:19.1349,lng:72.9155},
      {id:'vmcc',       name:'VMCC Convention Centre',     lat:19.1300,lng:72.9158},
      {id:'cse',        name:'KReSIT – CSE Dept',          lat:19.1337,lng:72.9132},
      {id:'hostel1',    name:'Hostel 1',                   lat:19.1323,lng:72.9115},
      {id:'hostel15',   name:'Hostel 15',                  lat:19.1273,lng:72.9108},
      {id:'market',     name:'IIT Market',                 lat:19.1302,lng:72.9128},
      {id:'gymkhana',   name:'Gymkhana Sports',            lat:19.1355,lng:72.9148},
      {id:'hospital',   name:'Health Centre',              lat:19.1330,lng:72.9102},
      {id:'gate2',      name:'Back Gate (Gate 2)',          lat:19.1285,lng:72.9097},
      {id:'qip',        name:'QIP Building',               lat:19.1312,lng:72.9150},
      {id:'tifr',       name:'TIFR Annexe',                lat:19.1295,lng:72.9155},
    ],
    wifi:[
      {id:'w1',name:'Nalanda WiFi (Campus)',      lat:19.1291,lng:72.9148,type:'main'},
      {id:'w2',name:'LHC WiFi (Campus)',          lat:19.1341,lng:72.9140,type:'main'},
      {id:'w3',name:'SAC Open WiFi',              lat:19.1349,lng:72.9155,type:'open'},
      {id:'w4',name:'Market Open WiFi',           lat:19.1302,lng:72.9128,type:'open'},
      {id:'w5',name:'Gate WiFi (Campus)',         lat:19.1327,lng:72.9133,type:'main'},
      {id:'w6',name:'Gymkhana Open WiFi',         lat:19.1355,lng:72.9148,type:'open'},
      {id:'w7',name:'VMCC WiFi (Campus)',         lat:19.1297,lng:72.9158,type:'main'},
      {id:'w8',name:'Hostel Zone WiFi (Campus)', lat:19.1300,lng:72.9110,type:'main'},
    ]
  },
  iit_delhi:{
    name:'IIT Delhi',city:'New Delhi',center:[28.5456,77.1926],zoom:16,
    buildings:[
      {id:'main_gate',  name:'Main Gate',               lat:28.5456,lng:77.1926},
      {id:'lib',        name:'Central Library',          lat:28.5457,lng:77.1887},
      {id:'lhc',        name:'Lecture Hall Complex',     lat:28.5454,lng:77.1915},
      {id:'cc',         name:'Computer Centre',          lat:28.5449,lng:77.1900},
      {id:'oat',        name:'OAT Lawns',                lat:28.5467,lng:77.1912},
      {id:'hostel_k',   name:'Kailash Hostel',           lat:28.5471,lng:77.1870},
      {id:'hostel_j',   name:'Jwalamukhi Hostel',        lat:28.5480,lng:77.1862},
      {id:'sports',     name:'Sports Complex',           lat:28.5485,lng:77.1904},
      {id:'admin',      name:'Administration Block',     lat:28.5448,lng:77.1905},
      {id:'sbi',        name:'SBI Branch & ATM',         lat:28.5447,lng:77.1892},
      {id:'nescafe',    name:'Nescafe Canteen',          lat:28.5453,lng:77.1908},
      {id:'gate2',      name:'Back Gate',                lat:28.5490,lng:77.1920},
      {id:'tinkering', name:'Innovation Lab',           lat:28.5442,lng:77.1910},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)',        lat:28.5457,lng:77.1887,type:'main'},
      {id:'w2',name:'LHC WiFi (Campus)',            lat:28.5454,lng:77.1915,type:'main'},
      {id:'w3',name:'OAT Open WiFi',               lat:28.5467,lng:77.1912,type:'open'},
      {id:'w4',name:'CC WiFi (Campus)',             lat:28.5449,lng:77.1900,type:'main'},
      {id:'w5',name:'Hostel Zone WiFi',            lat:28.5476,lng:77.1866,type:'main'},
      {id:'w6',name:'Gate WiFi (Campus)',           lat:28.5456,lng:77.1926,type:'main'},
      {id:'w7',name:'Sports Open WiFi',            lat:28.5485,lng:77.1904,type:'open'},
    ]
  },
  iit_madras:{
    name:'IIT Madras',city:'Chennai',center:[13.0101,80.2352],zoom:15,
    buildings:[
      {id:'main_gate',  name:'Main Gate',              lat:13.0101,lng:80.2352},
      {id:'lib',        name:'Central Library',         lat:13.0108,lng:80.2337},
      {id:'oat',        name:'Open Air Theatre',        lat:13.0089,lng:80.2312},
      {id:'gajendra',   name:'Gajendra Circle',         lat:13.0067,lng:80.2342},
      {id:'cse',        name:'CS Dept (Bharti)',        lat:13.0085,lng:80.2348},
      {id:'icsr',       name:'IC&SR Building',          lat:13.0092,lng:80.2361},
      {id:'sarayu',     name:'Sarayu Hostel',           lat:13.0116,lng:80.2298},
      {id:'cauvery',    name:'Cauvery Hostel',          lat:13.0120,lng:80.2310},
      {id:'deer_park',  name:'Deer Park',               lat:13.0122,lng:80.2315},
      {id:'sac',        name:'Student Activities Centre',lat:13.0078,lng:80.2326},
      {id:'dosa',       name:'Himalaya Mess (Dosa)',    lat:13.0090,lng:80.2330},
      {id:'medical',    name:'Medical Centre',          lat:13.0097,lng:80.2345},
      {id:'workshop',   name:'Central Workshop',        lat:13.0070,lng:80.2362},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)',    lat:13.0108,lng:80.2337,type:'main'},
      {id:'w2',name:'OAT Open WiFi',           lat:13.0089,lng:80.2312,type:'open'},
      {id:'w3',name:'IC&SR WiFi (Campus)',     lat:13.0092,lng:80.2361,type:'main'},
      {id:'w4',name:'Hostel Zone WiFi',        lat:13.0118,lng:80.2304,type:'main'},
      {id:'w5',name:'Gate WiFi (Campus)',      lat:13.0101,lng:80.2352,type:'main'},
      {id:'w6',name:'SAC Open WiFi',           lat:13.0078,lng:80.2326,type:'open'},
      {id:'w7',name:'Mess Open WiFi',          lat:13.0090,lng:80.2330,type:'open'},
    ]
  },
  bits_pilani:{
    name:'BITS Pilani',city:'Pilani, Rajasthan',center:[28.3637,75.5877],zoom:16,
    buildings:[
      {id:'main_gate',  name:'Main Gate',        lat:28.3637,lng:75.5877},
      {id:'lib',        name:'Central Library',   lat:28.3645,lng:75.5867},
      {id:'audi',       name:'Auditorium',        lat:28.3629,lng:75.5861},
      {id:'cnot',       name:"C'Not Canteen",    lat:28.3652,lng:75.5871},
      {id:'museum',     name:'Birla Museum',      lat:28.3640,lng:75.5858},
      {id:'malviya',    name:'Malviya Bhawan',    lat:28.3648,lng:75.5882},
      {id:'physics',    name:'Physics Dept',      lat:28.3633,lng:75.5869},
      {id:'cs_dept',    name:'CS & IS Dept',      lat:28.3638,lng:75.5863},
      {id:'medical',    name:'Medical Centre',    lat:28.3625,lng:75.5875},
      {id:'ram_bhawan', name:'Ram Bhawan',        lat:28.3655,lng:75.5880},
      {id:'meera',      name:'Meera Bhawan',      lat:28.3625,lng:75.5888},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)',  lat:28.3645,lng:75.5867,type:'main'},
      {id:'w2',name:"C'Not Open WiFi",       lat:28.3652,lng:75.5871,type:'open'},
      {id:'w3',name:'Gate WiFi (Campus)',     lat:28.3637,lng:75.5877,type:'main'},
      {id:'w4',name:'Bhawan Zone WiFi',       lat:28.3651,lng:75.5881,type:'main'},
      {id:'w5',name:'Audi Open WiFi',         lat:28.3629,lng:75.5861,type:'open'},
    ]
  },
  jadavpur:{
    name:'Jadavpur University',city:'Kolkata',center:[22.4996,88.3718],zoom:16,
    buildings:[
      {id:'main_gate',  name:'Main Gate',               lat:22.4996,lng:88.3718},
      {id:'lib',        name:'Central Library',          lat:22.5002,lng:88.3712},
      {id:'engg',       name:'Faculty of Engineering',   lat:22.4998,lng:88.3726},
      {id:'arts',       name:'Faculty of Arts',          lat:22.5007,lng:88.3722},
      {id:'hostels',    name:'Hostel Block',             lat:22.4988,lng:88.3730},
      {id:'aurobindo',  name:'Aurobindo Bhavan',         lat:22.5010,lng:88.3715},
      {id:'field',      name:'Sports Ground',            lat:22.4982,lng:88.3720},
      {id:'canteen',    name:'University Canteen',       lat:22.5001,lng:88.3720},
      {id:'cs_dept',    name:'Computer Science Dept',    lat:22.4995,lng:88.3728},
      {id:'gate2',      name:'Back Gate (Jadavpur Rd)', lat:22.4985,lng:88.3710},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)', lat:22.5002,lng:88.3712,type:'main'},
      {id:'w2',name:'Engg Open WiFi',        lat:22.4998,lng:88.3726,type:'open'},
      {id:'w3',name:'Gate WiFi (Campus)',    lat:22.4996,lng:88.3718,type:'main'},
      {id:'w4',name:'Hostel WiFi (Campus)', lat:22.4988,lng:88.3730,type:'main'},
      {id:'w5',name:'Canteen Open WiFi',     lat:22.5001,lng:88.3720,type:'open'},
    ]
  },
  nit_trichy:{
    name:'NIT Trichy',city:'Tiruchirappalli, TN',center:[10.7617,78.8120],zoom:15,
    buildings:[
      {id:'main_gate',  name:'Main Gate',          lat:10.7617,lng:78.8120},
      {id:'lib',        name:'Central Library',     lat:10.7628,lng:78.8130},
      {id:'admin',      name:'Admin Block',         lat:10.7623,lng:78.8138},
      {id:'cse',        name:'CSE Block',           lat:10.7630,lng:78.8145},
      {id:'hostel',     name:'Hostel Area',         lat:10.7640,lng:78.8125},
      {id:'sports',     name:'Sports Complex',      lat:10.7610,lng:78.8135},
      {id:'canteen',    name:'Central Canteen',     lat:10.7620,lng:78.8140},
      {id:'mech',       name:'Mech Engineering',    lat:10.7625,lng:78.8150},
      {id:'ece',        name:'ECE Block',           lat:10.7632,lng:78.8155},
      {id:'gate2',      name:'East Gate',           lat:10.7618,lng:78.8165},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)', lat:10.7628,lng:78.8130,type:'main'},
      {id:'w2',name:'CSE Open WiFi',         lat:10.7630,lng:78.8145,type:'open'},
      {id:'w3',name:'Gate WiFi (Campus)',    lat:10.7617,lng:78.8120,type:'main'},
      {id:'w4',name:'Hostel WiFi (Campus)', lat:10.7640,lng:78.8125,type:'main'},
      {id:'w5',name:'Canteen Open WiFi',     lat:10.7620,lng:78.8140,type:'open'},
    ]
  },
  iit_kharagpur:{
    name:'IIT Kharagpur',city:'Kharagpur, WB',center:[22.3190,87.3095],zoom:15,
    buildings:[
      {id:'main_gate',  name:'Main Gate',          lat:22.3193,lng:87.3095},
      {id:'lib',        name:'Central Library',     lat:22.3180,lng:87.3078},
      {id:'iem',        name:'IEM Building',        lat:22.3201,lng:87.3110},
      {id:'hall3',      name:'Hall 3 (Hostel)',     lat:22.3165,lng:87.3062},
      {id:'gymkhana',   name:'Gymkhana',            lat:22.3210,lng:87.3085},
      {id:'nehru',      name:'Nehru Museum',        lat:22.3175,lng:87.3095},
      {id:'cse',        name:'CSE Department',      lat:22.3188,lng:87.3105},
      {id:'b_arch',     name:'Architecture Dept',   lat:22.3196,lng:87.3125},
      {id:'rk_hall',    name:'R K Hall (Hostel)',    lat:22.3162,lng:87.3088},
      {id:'tech_market',name:'Tech Market',         lat:22.3172,lng:87.3080},
      {id:'med_centre', name:'Medical Centre',      lat:22.3185,lng:87.3068},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)',  lat:22.3180,lng:87.3078,type:'main'},
      {id:'w2',name:'IEM Open WiFi',          lat:22.3201,lng:87.3110,type:'open'},
      {id:'w3',name:'Gate WiFi (Campus)',     lat:22.3193,lng:87.3095,type:'main'},
      {id:'w4',name:'Hall Zone WiFi',         lat:22.3165,lng:87.3062,type:'main'},
      {id:'w5',name:'Gymkhana Open WiFi',     lat:22.3210,lng:87.3085,type:'open'},
      {id:'w6',name:'Tech Market Open WiFi', lat:22.3172,lng:87.3080,type:'open'},
    ]
  },
  amrita:{
    name:'Amrita University',city:'Coimbatore, TN',center:[11.0621,76.9194],zoom:16,
    buildings:[
      {id:'main_gate',  name:'Main Gate',        lat:11.0621,lng:76.9194},
      {id:'lib',        name:'Central Library',   lat:11.0628,lng:76.9185},
      {id:'engg_a',     name:'Engg Block A',      lat:11.0615,lng:76.9200},
      {id:'engg_b',     name:'Engg Block B',      lat:11.0612,lng:76.9208},
      {id:'hostel_m',   name:'Mens Hostel',       lat:11.0635,lng:76.9178},
      {id:'hostel_f',   name:'Womens Hostel',     lat:11.0638,lng:76.9190},
      {id:'canteen',    name:'Cafeteria',         lat:11.0619,lng:76.9190},
      {id:'sports',     name:'Sports Ground',     lat:11.0608,lng:76.9182},
      {id:'audi',       name:'Auditorium',        lat:11.0625,lng:76.9205},
      {id:'admin',      name:'Admin Block',       lat:11.0623,lng:76.9195},
    ],
    wifi:[
      {id:'w1',name:'Library WiFi (Campus)', lat:11.0628,lng:76.9185,type:'main'},
      {id:'w2',name:'Canteen Open WiFi',     lat:11.0619,lng:76.9190,type:'open'},
      {id:'w3',name:'Gate WiFi (Campus)',    lat:11.0621,lng:76.9194,type:'main'},
      {id:'w4',name:'Hostel WiFi (Campus)', lat:11.0636,lng:76.9184,type:'main'},
      {id:'w5',name:'Audi Open WiFi',        lat:11.0625,lng:76.9205,type:'open'},
    ]
  }
};

module.exports = {campuses,haversine,bearing,maneuver,buildGraph,interpolatePath,signalAt,CARDINAL};
