'use strict';
require('dotenv').config();

const app  = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Radar Instagram Backend');
  console.log('   Porta  : ' + PORT);
  console.log('   Env    : ' + (process.env.NODE_ENV || 'development'));
  console.log('   Supabase: ' + (process.env.SUPABASE_URL ? '✅ configurado' : '❌ FALTANDO'));
  console.log('   Meta   : ' + (process.env.META_APP_SECRET ? '✅ configurado' : '⚠️  sem validação de assinatura') + '\n');
});
