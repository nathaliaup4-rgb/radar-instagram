'use strict';
const supabase = require('./supabase');
async function processComment(comment) {
  const alertsToInsert = [];
  const commentText = (comment.text || '').toLowerCase();
  const commentUser = (comment.username || '').toLowerCase();
  const { data: users } = await supabase.from('monitored_users').select('username').eq('active', true);
  for (const { username } of (users || [])) {
    if (commentUser === username.toLowerCase()) {
      alertsToInsert.push({ comment_id: comment.id, type: 'monitored_user', reason: 'Usuario monitorado: @' + username, username: comment.username, comment_text: comment.text, post_url: comment.post_url || null });
    }
  }
  const { data: keywords } = await supabase.from('keywords').select('word').eq('active', true);
  for (const { word } of (keywords || [])) {
    if (commentText.includes(word.toLowerCase())) {
      alertsToInsert.push({ comment_id: comment.id, type: 'keyword', reason: 'Palavra-chave detectada: "' + word + '"', username: comment.username, comment_text: comment.text, post_url: comment.post_url || null });
    }
  }
  if (alertsToInsert.length > 0) {
    const { error } = await supabase.from('alerts').insert(alertsToInsert);
    if (error) console.error('[alert.service] Erro:', error.message);
    else alertsToInsert.forEach(a => console.log('ALERTA [' + a.type + '] - ' + a.reason));
  }
  return alertsToInsert;
}
module.exports = { processComment };
