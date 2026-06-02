'use strict';
const express = require('express'), router = express.Router(), supabase = require('../services/supabase');
router.get('/', async (_req,res) => { const {data,error}=await supabase.from('monitored_users').select('*').order('username',{ascending:true}); if(error) return res.status(500).json({error:error.message}); res.json({data}); });
router.post('/', async (req,res) => {
  let username=(req.body.username||'').replace(/^@/,'').trim().toLowerCase(); if(!username) return res.status(400).json({error:'username obrigatorio'});
  const {data,error}=await supabase.from('monitored_users').insert({username,notes:req.body.notes||null}).select().single();
  if(error){ if(error.code==='23505') return res.status(409).json({error:'ja cadastrado'}); return res.status(500).json({error:error.message}); }
  res.status(201).json({data});
});
router.delete('/:id', async (req,res) => { const {error}=await supabase.from('monitored_users').delete().eq('id',req.params.id); if(error) return res.status(500).json({error:error.message}); res.json({success:true}); });
module.exports = router;