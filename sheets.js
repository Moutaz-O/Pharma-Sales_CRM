'use strict';
/* Personal-user Google Sheets bridge for the EXTREME CRM prototype.
   Uses Google Identity Services and the OAuth access token in memory only.
   The spreadsheet remains private in Google Drive. No API key, client secret or
   service-account credential is embedded in this static website. */
window.SheetsBridge=(function(){
let token='',tokenExpiry=0,tokenClient=null,armed=false,timer=null,serial=Promise.resolve();
const names=['Customers','Visits','Sales','Collections','Activities','Channels','Milestones','Config'];
const cols={
Customers:['id','name','type','specialty','account','territory','phone','classification','frequency','notes','target'],
Visits:['id','customerId','date','time','status','productId','activity','feedback','resources','nextAction','nextDate','createdAt','submittedAt','modifiedAt'],
Sales:['id','date','account','channelId','productId','units','unitPrice','discount','reference'],
Collections:['id','date','account','amount','reference'],
Activities:['id','date','type','account','resource','cost','notes'],
Channels:['id','name','short','priority','targetUnits','tone','description'],
Milestones:['id','title','channelId','period','status'],
Config:['key','value']
};
const key={Customers:'customers',Visits:'visits',Sales:'sales',Collections:'collections',Activities:'activities',Channels:'channels',Milestones:'milestones'};
function alertUser(t){if(window.ExtremeCRM)window.ExtremeCRM.toast(t);else alert(t);}
function id(s){const m=String(s||'').match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/);return m?m[1]:String(s||'').trim();}
function connected(){return !!token&&Date.now()<tokenExpiry;}
function auth(settings){return new Promise((resolve,reject)=>{
if(!settings.clientId)return reject(new Error('Enter a Google OAuth Client ID in Settings.'));
if(!window.google||!google.accounts||!google.accounts.oauth2)return reject(new Error('Google Identity Services is not loaded. Check your internet connection.'));
try{tokenClient=google.accounts.oauth2.initTokenClient({client_id:settings.clientId,scope:'https://www.googleapis.com/auth/spreadsheets',callback:(reply)=>{if(reply.error)return reject(new Error(reply.error));token=reply.access_token;tokenExpiry=Date.now()+(Number(reply.expires_in||3500)-40)*1000;alertUser('Google authorized. Choose Load from Sheets or Sync to Sheets.');if(window.ExtremeCRM)window.ExtremeCRM.refresh();resolve(true);}});tokenClient.requestAccessToken({prompt:'consent'});}catch(err){reject(err);}
});}
function request(url,method,body){if(!connected())return Promise.reject(new Error('Google authorization required or expired.'));return fetch(url,{method:method||'GET',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(async res=>{const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error((body.error&&body.error.message)||('Google API HTTP '+res.status));return body;});}
function sheetUrl(settings){const s=id(settings.spreadsheetId);if(!s)throw new Error('Enter the Google Spreadsheet ID first.');return 'https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(s);}
function serialize(state){
const out={};
for(const sheet of names){
if(sheet==='Config'){out[sheet]=[['key','value'],...Object.entries(state.settings||{}).map(([k,v])=>[k,String(v??'')])];continue;}
const fields=cols[sheet],items=state[key[sheet]]||[];
out[sheet]=[fields,...items.map(item=>fields.map(k=>item[k]===undefined||item[k]===null?'':item[k]))];
}
return out;
}
function decode(values,fields){const rows=(values||[]).slice(1);return rows.filter(x=>x.some(v=>v!==''&&v!==null&&v!==undefined)).map(row=>{const r={};fields.forEach((k,i)=>{let v=row[i]??'';if(k==='target')v=(v===true||String(v).toUpperCase()==='TRUE');if(['priority','targetUnits','frequency','units','unitPrice','discount','amount','cost'].includes(k))v=Number(v||0);r[k]=v;});return r;});}
async function pull(settings){try{const base=sheetUrl(settings);if(!connected()){alertUser('Authorize Google first.');return null;}if(window.ExtremeCRM&&window.ExtremeCRM.getData().customers.length){if(!confirm('Load from Google Sheets and replace the local working copy? Export a JSON backup first if you have unsynced edits.'))return null;}
const ranges=names.map(n=>encodeURIComponent("'"+n+"'!A1:U"));const q=ranges.map(r=>'ranges='+r).join('&');const res=await request(base+'/values:batchGet?'+q+'&valueRenderOption=UNFORMATTED_VALUE');
const snapshot={};(res.valueRanges||[]).forEach((r,i)=>{const n=names[i];if(n==='Config'){snapshot.settings=Object.fromEntries((r.values||[]).slice(1).filter(x=>x[0]).map(x=>[String(x[0]),x[1]??'']));}
else snapshot[key[n]]=decode(r.values,cols[n]);});
if(Object.keys(snapshot).length){armed=true;alertUser('Google Sheets data loaded. Auto-sync enabled.');}
return snapshot;
}catch(err){alertUser('Google load failed: '+err.message);return null;}}
async function pushInternal(state,manual){if(!connected())throw new Error('Authorize Google first.');const base=sheetUrl(state.settings);const payload=serialize(state);
const clearRanges=names.map(n=>"'"+n+"'!A2:U");
await request(base+'/values:batchClear','POST',{ranges:clearRanges});
await request(base+'/values:batchUpdate','POST',{valueInputOption:'RAW',data:names.map(n=>({range:"'"+n+"'!A1",majorDimension:'ROWS',values:payload[n]}))});
armed=true;if(manual)alertUser('Google Sheets synchronized successfully.');}
function push(state){if(!connected()){alertUser('Authorize Google first.');return;}
if(!confirm('Sync will overwrite the CRM tabs in the selected Google Sheet with the current browser data. Continue?'))return;
serial=serial.then(()=>pushInternal(state,true)).catch(err=>alertUser('Google sync failed: '+err.message));return serial;
}
function schedulePush(state){if(!connected()||!armed)return;clearTimeout(timer);timer=setTimeout(()=>{const snapshot=JSON.parse(JSON.stringify(state));serial=serial.then(()=>pushInternal(snapshot,false)).catch(err=>alertUser('Auto-sync failed: '+err.message));},1200);}
async function connect(settings){try{await auth(settings);}catch(e){alertUser('Google authorization failed: '+e.message);}}
return{connect,connected,pull,push,schedulePush};
})();