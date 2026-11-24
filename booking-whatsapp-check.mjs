import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile('site.js','utf8');
const code=source.slice(source.indexOf("const form = document.querySelector('#booking');"),source.indexOf('// Only the active service'));
function setup(values={},valid=true) {
 const events={};let opened;
 const service={options:[{value:'flatbed-towing'}],selectedOptions:[{textContent:'Flatbed car towing & recovery'}]};
 const timing={value:'As soon as available',addEventListener(n,fn){events.timing=fn;}},date={required:false};
 const submit={disabled:true},status={textContent:''},prepared={hidden:true};
 const fields={name:' Test customer ',phone:' +971500000000 ',service:'flatbed-towing',pickup:' Al Barsha, entrance A & B ',vehicle:' Sports car ',destination:' Garage ',timing:'As soon as available',datetime:'',details:' Low clearance ',...values};
 const form={dataset:{whatsapp:'971504141048'},elements:{namedItem(n){return {service,timing,datetime:date}[n];}},reportValidity(){return valid;},addEventListener(n,fn){events[n]=fn;},querySelector(s){return s==='.pickup-submit'?submit:s==='#pickup-send-status'?status:prepared;}};
 vm.runInNewContext(code,{document:{querySelector(s){return s==='#booking'?form:{hidden:true};}},location:{search:'',assign(url){opened=url;}},navigator:{get geolocation(){throw Error('GPS must not be accessed');}},URLSearchParams,FormData:class {get(n){return fields[n]??'';}}});
 return{events,submit,date,timing,get opened(){return opened;}};
}
let a=setup();assert.equal(a.submit.disabled,false);await a.events.submit({preventDefault(){}});
let url=new URL(a.opened);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/971504141048');let text=url.searchParams.get('text');
for(const value of ['Name: Test customer','Phone: +971500000000','Service: Flatbed car towing & recovery','Pickup: Al Barsha, entrance A & B','Vehicle: Sports car','Drop-off: Garage','Details: Low clearance']) assert.ok(text.includes(value),value);
a=setup({pickup:'',vehicle:'',destination:'',details:''});await a.events.submit({preventDefault(){}});text=new URL(a.opened).searchParams.get('text');assert.ok(!text.includes('Pickup:'));assert.ok(!text.includes('Vehicle:'));assert.ok(text.includes('Name: Test customer'));
a=setup({},false);await a.events.submit({preventDefault(){}});assert.equal(a.opened,undefined);
a=setup({timing:'Scheduled pickup',datetime:'2026-12-01T14:30'});a.timing.value='Scheduled pickup';a.events.timing();assert.equal(a.date.required,true);await a.events.submit({preventDefault(){}});assert.ok(new URL(a.opened).searchParams.get('text').includes('Preferred time: 2026-12-01T14:30'));
console.log('Booking WhatsApp checks passed: name, phone, service, manual pickup, optional details, scheduled time, empty pickup, invalid form and no GPS access.');
