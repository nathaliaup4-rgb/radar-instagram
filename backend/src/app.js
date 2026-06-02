'use strict';
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const webhookRoute        = require('./routes/webhook');
const commentsRoute       = require('./routes/comments');
const alertsRoute         = require('./routes/alerts');
const keywordsRoute       = require('./routes/keywords');
const monitoredUsersRoute = require('./routes/monitored-users');

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET','POST','PATCH','DELETE'] }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/webhook',             webhookRoute);
app.use('/api/comments',        commentsRoute);
app.use('/api/alerts',          alertsRoute);
app.use('/api/keywords',        keywordsRoute);
app.use('/api/monitored-users', monitoredUsersRoute);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'radar-instagram', version: '1.0.0', ts: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ error: 'rota nao encontrada' }));
app.use((err, _req, res, _next) => { console.error('[ERROR]', err); res.status(500).json({ error: 'erro interno', detail: err.message }); });

module.exports = app;
