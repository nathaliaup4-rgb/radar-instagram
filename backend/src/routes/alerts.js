'use strict';
const express = require('express'), router = express.Router(), supabase = require('../services/supabase');
router.get('/', async (req,res) => {
  const limit = Math.min(200,parseInt(req.query.limit||50));
  let q = supabase.from('alerts').select('*',{count:'exact'}).order('created_at',{ascending:false}).limit(limit);
  if (req.query.type) q = q.eq('type',req.query.type);
  if (req.query.unread==='true') q = q.eq('read',false);
  const {data,error,count} = await q;
  if (error) return res.status(500).json({error:error.message});
  res.json({data,total:count});
});
router.patch('/read-all', async (_req,res) => {
  const {error} = await supabase.from('alerts').update({read:true}).eq('read',false);
  if (error) return res.status(500).json({error:error.message});
  res.json({success:true});
});
router.patch('/:id/read', async (req,res) => {
  const {error} = await supabase.from('alerts').update({read:true}).eq('id',req.params.id);
  if (error) return res.status(500).json({error:error.message});
  res.json({success:true});
});
module.exports = router;
