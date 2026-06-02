'use strict';
const express = require('express'), router = express.Router(), supabase = require('../services/supabase');
router.get('/', async (req, res) => {
  const page=Math.max(1,parseInt(req.query.page||1)), limit=Math.min(100,parseInt(req.query.limit||20)), from=(page-1)*limit;
  let q = supabase.from('instagram_comments').select('*',{count:'exact'}).order('timestamp',{ascending:false}).range(from,from+limit-1);
  if (req.query.username) q = q.ilike('username','%'+req.query.username+'%');
  const {data,error,count} = await q;
  if (error) return res.status(500).json({error:error.message});
  res.json({data,total:count,page,limit,pages:Math.ceil((count||0)/limit)});
});
router.get('/stats', async (_req,res) => {
  const [c,a,u,k] = await Promise.all([
    supabase.from('instagram_comments').select('*',{count:'exact',head:true}),
    supabase.from('alerts').select('*',{count:'exact',head:true}).eq('read',false),
    supabase.from('monitored_users').select('*',{count:'exact',head:true}).eq('active',true),
    supabase.from('keywords').select('*',{count:'exact',head:true}).eq('active',true)
  ]);
  res.json({total_comments:c.count||0,unread_alerts:a.count||0,monitored_users:u.count||0,active_keywords:k.count||0});
});
module.exports = router;