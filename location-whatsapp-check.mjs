import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile('location-whatsapp.js','utf8');
function setup(geolocation, number='https://wa.me/971504141048') {
 let click, opened; const attrs=new Map();
 const trigger={dataset:{locationWhatsapp:number},addEventListener(n,fn){click=fn;},setAttribute(k,v){attrs.set(k,v);},removeAttribute(k){attrs.delete(k);}};
 const status={hidden:true,textContent:''};
 vm.runInNewContext(source,{document:{querySelector:s=>s.includes('data-location')?trigger:status},navigator:{geolocation},window:{location:{assign:url=>opened=url}},URL,Number,Math,encodeURIComponent});
 return {click:(extra={})=>click({preventDefault(){},...extra}),status,attrs,get opened(){return opened;}};
}
let callback,options,calls=0;
let app=setup({getCurrentPosition(success,error,opts){callback=success;options=opts;calls++;}});
app.click();app.click();assert.equal(calls,1);assert.equal(app.attrs.get('aria-busy'),'true');
callback({coords:{latitude:25.204849,longitude:55.270783,accuracy:12.1}});
let url=new URL(app.opened);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/971504141048');assert.match(url.searchParams.get('text'),/25.204849%2C55.270783/);assert.match(url.searchParams.get('text'),/accuracy: 13 m/);assert.equal(options.maximumAge,0);assert.equal(options.enableHighAccuracy,true);assert.match(app.status.textContent,/Tap Send/);assert.equal(app.attrs.size,0);
for(const code of [1,2,3]) {let a=setup({getCurrentPosition(s,error){error({code});}});a.click();assert.equal(a.opened,undefined);assert.equal(a.attrs.size,0);assert.ok(a.status.textContent.length>20);}
for(const coords of [{latitude:91,longitude:0,accuracy:10},{latitude:25,longitude:55,accuracy:2000},{latitude:NaN,longitude:55,accuracy:10}]) {let a=setup({getCurrentPosition(success){success({coords});}});a.click();assert.equal(a.opened,undefined);assert.match(a.status.textContent,/not precise enough/);}
let unsupported=setup(undefined);unsupported.click();assert.equal(unsupported.opened,undefined);assert.match(unsupported.status.textContent,/cannot get a location/);
let modified=setup({getCurrentPosition(){throw Error('Must not run');}});modified.click({ctrlKey:true});assert.equal(modified.opened,undefined);
let invalid=setup({getCurrentPosition(){throw Error('Must not run');}},'https://evil.example/971504141048');invalid.click();assert.equal(invalid.opened,undefined);assert.match(invalid.status.textContent,/unavailable/);
console.log('WhatsApp destination, map-pin message, fresh GPS, repeated-click guard, denied access, timeout, invalid coordinates and unsupported browser checks passed.');
