const section = document.querySelector('#customer-feedback');
if (section) {
  const track=section.querySelector('.feedback-track'), form=section.querySelector('form');
  const status=section.querySelector('[data-review-load]'), submitted=section.querySelector('[data-review-submit]');
  const average=section.querySelector('[data-review-average]'), button=form.querySelector('button[type="submit"]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false, timer=0, pauseUntil=0, direction=1;
  const seen=new Set();
  function card(review,prepend=false) {
    if (seen.has(review.id)) return;
    seen.add(review.id);
    track.closest('.feedback-deck').hidden=false;
    const item=document.createElement('li'); item.className='feedback-card';
    const figure=document.createElement('figure'); figure.className='feedback-surface';
    const meta=document.createElement('figcaption'); meta.className='feedback-card-meta';
    const author=document.createElement('span'); author.className='feedback-author'; author.textContent=review.author;
    const stars=document.createElement('span'); stars.className='feedback-rating'; stars.textContent=`${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)} ${review.rating}/5`;
    const quote=document.createElement('blockquote'), text=document.createElement('p'); text.textContent=review.text;
    quote.append(text); meta.append(author,stars); figure.append(meta,quote); item.append(figure);
    if(prepend) track.prepend(item); else track.append(item);
  }
  async function load() {
    try {
      const response=await fetch('/api/reviews',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error();
      const result=await response.json();
      if(!Array.isArray(result.reviews)) throw new Error();
      result.reviews.forEach(review=>card(review));
      status.textContent=seen.size ? '' : 'Be the first to share your experience.';
      status.hidden=seen.size>0;
      if(typeof result.average==='number') { average.hidden=false; average.textContent=`Average customer rating ${result.average.toFixed(1)} / 5${result.limitedSummary ? ' from recent reviews' : ''}`; }
      schedule();
    } catch { status.hidden=false; status.textContent='Reviews could not be loaded. Please try again shortly.'; }
  }
  function shift(by) {
    const cards=[...track.children]; if(!cards.length) return;
    const max=track.scrollWidth-track.clientWidth;
    const start=cards[0].getBoundingClientRect().left;
    const stops=cards.map(c=>Math.min(max,c.getBoundingClientRect().left-start));
    let next=by>0 ? stops.find(n=>n>track.scrollLeft+2) : stops.findLast(n=>n<track.scrollLeft-2);
    if(next===undefined) { direction*=-1; next=by>0 ? 0 : max; }
    track.scrollTo({left:next,behavior:reduced.matches?'instant':'smooth'});
  }
  function schedule() {
    clearTimeout(timer);
    if(!visible || document.hidden || reduced.matches || track.scrollWidth<=track.clientWidth) return;
    timer=setTimeout(()=>{shift(direction);schedule();},Math.max(4500,pauseUntil-Date.now()));
  }
  for(const name of ['pointerdown','wheel','keydown']) track.addEventListener(name,()=>{pauseUntil=Date.now()+5000;schedule();},{passive:true});
  track.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();shift(event.key==='ArrowRight'?1:-1);}});
  section.querySelector('[data-review-prev]').addEventListener('click',()=>{shift(-1);pauseUntil=Date.now()+5000;schedule();});
  section.querySelector('[data-review-next]').addEventListener('click',()=>{shift(1);pauseUntil=Date.now()+5000;schedule();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();}).observe(track);
  document.addEventListener('visibilitychange',schedule); reduced.addEventListener('change',schedule);
  button.disabled=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault(); if(!form.reportValidity()) return;
    const data=new FormData(form);
    button.disabled=true;submitted.textContent='Publishing your review...';
    try {
      const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:data.get('author'),rating:Number(data.get('rating')),text:data.get('text'),website:data.get('website'),consent:data.get('consent')==='on'}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error || 'Your review could not be saved.');
      card(result.review,true); form.reset(); status.hidden=true;
      submitted.textContent='Your review is now published. Thank you.';
      track.scrollTo({left:0,behavior:'smooth'});load();
    } catch(error) { submitted.textContent=error.name==='TimeoutError' ? 'The request timed out. Refresh to check whether your review appeared before trying again.' : error.message || 'Your review could not be saved. Please try again.'; }
    finally { button.disabled=false; }
  });
  load();
}
