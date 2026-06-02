'use strict';
const supabase = require('./supabase');
async function saveComment(payload) {
  const { comment_id, post_id, post_url, username, user_id, text, timestamp, raw_payload } = payload;
  const { data, error } = await supabase.from('instagram_comments').upsert({ comment_id, post_id, post_url, username, user_id, text, timestamp, raw_payload }, { onConflict: 'comment_id' }).select().single();
  if (error) { console.error('[comment.service]', error.message); throw error; }
  return data;
}
module.exports = { saveComment };