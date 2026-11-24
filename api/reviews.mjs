import { createHash, randomUUID } from 'node:crypto';
import { get, list, put, del } from '@vercel/blob';

const origins = new Set(['https://www.dubaicarrecoverynearme.com', 'https://dubaicarrecoverynearme.com']);
const prefix = process.env.VERCEL_ENV === 'preview' ? 'preview-customer-reviews-v1/' : 'customer-reviews-v1/';
if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
const clean = value => typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, '') : '';
export function validateReview(body) {
  if (!body || typeof body !== 'object' || body.website) throw new Error('Please check your review.');
  const author = clean(body.author), text = clean(body.text), rating = Number(body.rating);
  if (author.length < 2 || author.length > 60 || text.length < 15 || text.length > 1200 || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Enter a name, a rating from 1 to 5, and a review of 15 to 1,200 characters.');
  return { author, text, rating };
}
export function createHandler(storage = { get, list, put, del }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const respond = (code, data) => res.status(code).json(data);
    if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return respond(405,{error:'Method not allowed.'}); }
    try {
      if (req.method === 'GET') {
        const blobs = []; let cursor;
        do {
          const page = await storage.list({ prefix, limit: 1000, ...(cursor ? {cursor} : {}) });
          blobs.push(...page.blobs); cursor = page.hasMore ? page.cursor : null;
          if (blobs.length >= 10000) break;
        } while (cursor);
        blobs.sort((a,b)=>a.pathname.localeCompare(b.pathname));
        const ratings = blobs.map(b=>Number(b.pathname.match(/-r([1-5])-/)?.[1])).filter(Boolean);
        const reviews = [];
        // Bound parallel reads to avoid exhausting the function or storage connection pool.
        for (let i=0;i<Math.min(blobs.length,50);i+=8) {
          const batch = await Promise.all(blobs.slice(i,Math.min(i+8,50)).map(async blob=>{
            const result = await storage.get(blob.pathname,{access:'private',useCache:false});
            if (!result?.stream) throw new Error('Review read failed');
            const value = await new Response(result.stream).json();
            const valid = validateReview(value);
            return {...valid,id:value.id,createdAt:value.createdAt};
          }));
          reviews.push(...batch);
        }
        return respond(200,{reviews,average:ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : null,hasOlder:blobs.length>50,limitedSummary:blobs.length>=10000});
      }
      if (!origins.has(req.headers.origin)) return respond(403,{error:'Submit your review from our website.'});
      if (!String(req.headers['content-type']||'').includes('application/json')) return respond(415,{error:'Send JSON.'});
      if (Number(req.headers['content-length']||0)>8000) return respond(413,{error:'Your review is too long.'});
      let body;
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; if (JSON.stringify(body).length>8000) throw new Error(); }
      catch { return respond(400,{error:'Please check your review.'}); }
      let review;
      try { review=validateReview(body); } catch(error) { return respond(400,{error:error.message}); }
      // A per-address time bucket is an atomic create, so parallel requests cannot bypass it.
      const address = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      const fingerprint = createHash('sha256').update(address).digest('hex');
      const guard = `review-limits-v1/${fingerprint}-${Math.floor(Date.now()/1800000)}.json`;
      try { await storage.put(guard,'{}',{access:'private',allowOverwrite:false,ttlDays:1,contentType:'application/json'}); }
      catch(error) { if (error.name==='BlobAlreadyExistsError' || /already exists/i.test(error.message)) return respond(429,{error:'Please wait 30 minutes before submitting another review.'}); throw error; }
      const now=Date.now();
      review={...review,id:randomUUID(),createdAt:new Date(now).toISOString()};
      const pathname=`${prefix}${String(9999999999999-now)}-r${review.rating}-${review.id}.json`;
      try { await storage.put(pathname,JSON.stringify(review),{access:'private',allowOverwrite:false,contentType:'application/json'}); }
      catch(error) { await storage.del(guard).catch(()=>{}); throw error; }
      return respond(201,{review});
    } catch(error) {
      console.error('Review storage unavailable',error.name);
      return respond(503,{error:'Reviews are temporarily unavailable. Please try again shortly.'});
    }
  };
}
export default createHandler();
