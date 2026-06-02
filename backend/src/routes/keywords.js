'use strict';
const express = require('express'), router = express.Router(), supabase = require('../services/supabase');
router.get('/', async (_req,res) => { const {data,error}=await supabase.from('keywords').select('*').order('word',{ascending:true}); if(error) return res.status(500).json({error:error.message}); res.json({data}); });
router.post('/', async (req,res) => {
  const word=(req.body.word||'').trim().toLowerCase(); if(!word) return res.status(400).json({error:'word obrigatorio'});
  const {data,error}=await supabase.from('keywords').insert({word}).select().single();
  if(error){ if(error.code==='23505') return res.status(409).json({error:'ja cadastrada'}); return res.status(500).json({error:error.message}); }
  res.status(201).json({data});
});
router.delete('/:id', async (req,res) => { const {error}=await supabase.from('keywords').delete().eq('id',req.params.id); if(error) return res.status(500).json({error:error.message}); res.json({success:true}); });
module.exports = router;