const section = document.querySelector('#customer-feedback');
if (section) {
  const track=section.querySelector('.feedback-track'), form=section.querySelector('form');
  const status=section.querySelector('[data-review-load]'), submitted=section.querySelector('[data-review-submit]');
  const average=section.querySelector('[data-review-average]'), button=form.querySelector('button[type="submit"]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false, timer=0, pauseUntil=0, direction=1;
  const seen=new Set();
  function starRow(rating) {
    const row=document.createElement('span'); row.className='review-gold-stars';
    row.setAttribute('role','img'); row.setAttribute('aria-label',`${rating} out of 5 stars`);
    for(let i=0;i<5;i++) {
      const star=document.createElement('span'); star.className='review-gold-star';
      star.textContent='★'; star.setAttribute('aria-hidden','true');
      const fill=Math.max(0,Math.min(1,rating-i))*100;
      star.style.setProperty('--star-fill',`${fill}%`);
      star.style.setProperty('--star-delay',`${i*.35}s`);
      row.append(star);
    }
    return row;
  }
  function showAverage(result) {
    if(typeof result.average!=='number' || !Number.isFinite(result.average)) { average.hidden=true; return; }
    const rating=Math.max(1,Math.min(5,result.average));
    const label=document.createElement('span'); label.className='review-average-label';
    label.textContent=`Average customer rating ${Number(rating.toFixed(1))} / 5${result.limitedSummary ? ' from recent reviews' : ''}`;
    average.replaceChildren(label,starRow(rating)); average.hidden=false;
  }
  function card(review,prepend=false) {
    if (seen.has(review.id)) return;
    seen.add(review.id);
    track.closest('.feedback-deck').hidden=false;
    const item=document.createElement('li'); item.className='feedback-card';
    const figure=document.createElement('figure'); figure.className='feedback-surface';
    const meta=document.createElement('figcaption'); meta.className='feedback-card-meta';
    const author=document.createElement('span'); author.className='feedback-author'; author.textContent=review.author;
    const stars=document.createElement('span'); stars.className='feedback-rating'; stars.append(starRow(review.rating),document.createTextNode(` ${review.rating}/5`));
    const quote=document.createElement('blockquote'), text=document.createElement('p'); text.textContent=review.text;
    quote.append(text); meta.append(author,stars); figure.append(meta,quote); item.append(figure);
    if(prepend) track.prepend(item); else track.append(item);
    section.querySelector('.review-controls').hidden=track.children.length<2;
  }
  async function load() {
    try {
      const response=await fetch('/api/reviews',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error();
      const result=await response.json();
      if(!Array.isArray(result.reviews)) throw new Error();
      result.reviews.forEach(review=>card(review));
      status.textContent='';
      status.hidden=true;
      showAverage(result);
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
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;section.dataset.feedbackVisible=String(visible);schedule();}).observe(section);
  document.addEventListener('visibilitychange',schedule); reduced.addEventListener('change',schedule);
  button.disabled=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault(); if(!form.reportValidity()) return;
    const data=new FormData(form);
    button.disabled=true;submitted.textContent='Publishing your review...';
    try {
      const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:data.get('author'),rating:Number(data.get('rating')),text:data.get('text'),website:data.get('website')}),signal:AbortSignal.timeout(20000)});
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
