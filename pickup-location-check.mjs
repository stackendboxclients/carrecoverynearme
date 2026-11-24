import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile('site.js','utf8');
const code=source.slice(source.indexOf("  const status = document.querySelector('#location-status');"),source.indexOf("  const sendStatus = form.querySelector('#pickup-send-status');"));
function setup(geolocation,number='971504141048') {
 const events={};const pickup={value:'',addEventListener(n,fn){events.input=fn;}};
 const button={disabled:false,addEventListener(n,fn){events.click=fn;}};
 const status={textContent:''},map={hidden:true};let opened;
 const form={dataset:{whatsapp:number},elements:{namedItem(){return pickup;}},querySelector(s){return s==='#location'?button:map;}};
 vm.runInNewContext(code,{document:{querySelector(){return status;}},form,navigator:{geolocation},window:{location:{assign(url){opened=url;}}},URL,Number,Math,encodeURIComponent});
 return{events,button,status,pickup,map,get opened(){return opened;}};
}
let done,options,calls=0;
let a=setup({getCurrentPosition(success,error,opts){done=success;options=opts;calls++;}});
a.events.click();a.events.click();assert.equal(calls,1);assert.equal(a.button.disabled,true);
done({coords:{latitude:25.204849,longitude:55.270783,accuracy:12.1}});
const url=new URL(a.opened);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/971504141048');assert.match(url.searchParams.get('text'),/25.204849%2C55.270783/);assert.equal(a.pickup.value,a.map.href);assert.match(a.status.textContent,/Tap Send/);assert.equal(a.button.disabled,false);assert.equal(options.maximumAge,0);assert.equal(options.enableHighAccuracy,true);
for(const code of [1,2,3]){a=setup({getCurrentPosition(s,fail){fail({code});}});a.events.click();assert.equal(a.opened,undefined);assert.equal(a.button.disabled,false);assert.ok(a.status.textContent.length>20);}
for(const coords of [{latitude:91,longitude:55,accuracy:10},{latitude:25,longitude:55,accuracy:2000},{latitude:25,longitude:NaN,accuracy:10}]){a=setup({getCurrentPosition(s){s({coords});}});a.events.click();assert.equal(a.opened,undefined);assert.match(a.status.textContent,/precise/);}
a=setup({getCurrentPosition(){throw Error('GPS failed');}});a.events.click();assert.equal(a.button.disabled,false);assert.equal(a.opened,undefined);
a=setup(undefined);a.events.click();assert.match(a.status.textContent,/unavailable/);
a=setup({getCurrentPosition(){throw Error('Must not run');}},'bad-number');a.events.click();assert.match(a.status.textContent,/contact is unavailable/);
a=setup({getCurrentPosition(s){done=s;}});a.events.click();a.events.input();a.pickup.value='Customer typed landmark';done({coords:{latitude:25,longitude:55,accuracy:10}});assert.equal(a.opened,undefined);assert.equal(a.pickup.value,'Customer typed landmark');
console.log('Pickup location checks passed: WhatsApp map draft, destination, fresh GPS, duplicate clicks, permission denial, timeout, invalid GPS, unsupported browser, thrown errors and edited pickup protection.');
