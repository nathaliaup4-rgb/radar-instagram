'use strict';
const express = require('express'), crypto = require('crypto'), router = express.Router();
const { saveComment } = require('../services/comment.service');
const { processComment } = require('../services/alert.service');
router.get('/', (req, res) => {
  const {['hub.mode']:mode, ['hub.verify_token']:token, ['hub.challenge']:challenge} = req.query;
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});
router.post('/', async (req, res) => {
  const sig = req.headers['x-hub-signature-256'];
  if (process.env.META_APP_SECRET && sig) {
    const exp = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(req.body).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return res.sendStatus(403);
  }
  res.sendStatus(200);
  let body; try { body = JSON.parse(req.body.toString()); } catch(e) { return; }
  if (body.object !== 'instagram') return;
  for (const entry of (body.entry||[])) for (const change of (entry.changes||[])) {
    if (change.field !== 'comments') continue;
    const v = change.value;
    try {
      const p = { comment_id: v.id, post_id: v.media?.id||v.parent_id||entry.id||'', post_url: v.media?.permalink||null, username: v.from?.username||v.from?.name||'desconhecido', user_id: v.from?.id||null, text: v.text||'', timestamp: v.timestamp ? new Date(v.timestamp*1000).toISOString() : new Date().toISOString(), raw_payload: v };
      const saved = await saveComment(p); await processComment(saved);
    } catch(err) { console.error('[webhook]', err.message); }
  }
});
module.exports = router;