const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const projectRoot = path.join(__dirname, '..');
const dataFile = path.join(projectRoot, 'data', 'ppls.json');
const dataFilePlc = path.join(projectRoot, 'data', 'plc.json');
const dataFileBblc = path.join(projectRoot, 'data', 'bblc.json');
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

async function readPpls() {
	const ppls = JSON.parse(await fs.readFile(dataFile, 'utf8'));
	if (!Array.isArray(ppls)) {
		throw new Error('ppls.json must contain a JSON array');
	}
	return ppls;
	
}

async function writePpls(ppls) {
	const temporaryFile = `${dataFile}.${process.pid}.tmp`;
	await fs.writeFile(temporaryFile, `${JSON.stringify(ppls, null, 2)}\n`, 'utf8');
	await fs.rename(temporaryFile, dataFile);
}

async function readPlc() {
	const plc = JSON.parse(await fs.readFile(dataFilePlc, 'utf8'));
	if (!Array.isArray(plc)) {
		throw new Error('plc.json must contain a JSON array');
	}
	return plc;
}

async function writePlc(plc) {
	const temporaryFile = `${dataFilePlc}.${process.pid}.tmp`;
	await fs.writeFile(temporaryFile, `${JSON.stringify(plc, null, 2)}\n`, 'utf8');
	await fs.rename(temporaryFile, dataFilePlc);
}

async function readBblc() {
	const bblc = JSON.parse(await fs.readFile(dataFileBblc, 'utf8'));
	if (!Array.isArray(bblc) || bblc.some((book) =>
		!Array.isArray(book) || book.some((chapter) =>
			!Array.isArray(chapter) || !chapter[0] || typeof chapter[0] !== 'object' || Array.isArray(chapter[0])
		)
	)) {
		throw new Error('bblc.json must contain books with arrays of chapters');
	}
	return bblc;
}

async function writeBblc(bblc) {
	const temporaryFile = `${dataFileBblc}.${process.pid}.tmp`;
	await fs.writeFile(temporaryFile, `${JSON.stringify(bblc, null, 2)}\n`, 'utf8');
	await fs.rename(temporaryFile, dataFileBblc);
}

function validPpl(ppl) {
	return ppl && typeof ppl === 'object' && !Array.isArray(ppl) &&
		typeof ppl.id === 'string' && ppl.id.trim().length > 0;
}

function parseArrayIndex(value) {
	if (!/^\d+$/.test(value)) return -1;
	return Number(value);
}

function validPlcRecord(record) {
	return record && typeof record === 'object' && !Array.isArray(record) &&
		typeof record.id === 'string' && record.id.trim().length > 0 &&
		['name1', 'nameE1'].some((field) => typeof record[field] === 'string' && record[field].trim());
}

function parsePlcIndex(value) {
	if (!/^\d+$/.test(value)) return -1;
	return Number(value);
}

app.get('/api/admin/bblc', async (req, res) => {
	res.json(await readBblc());
});

app.put('/api/admin/bblc/:book/:chapter/:verse', async (req, res) => {
	const bookIndex = parseArrayIndex(req.params.book);
	const chapterIndex = parseArrayIndex(req.params.chapter);
	const verseIndex = parseArrayIndex(req.params.verse);
	const verse = req.body;
	if (!verse || typeof verse !== 'object' || Array.isArray(verse) ||
		typeof verse.id !== 'string' || !verse.id.trim()) {
		return res.status(400).json({ error: 'A verse with a non-empty string id is required.' });
	}

	const bblc = await readBblc();
	const chapter = bblc[bookIndex] && bblc[bookIndex][chapterIndex];
	if (!chapter || verseIndex < 1 || verseIndex >= chapter.length) {
		return res.status(404).json({ error: 'Verse not found.' });
	}

	chapter[verseIndex] = verse;
	await writeBblc(bblc);
	res.json(verse);
});

app.get('/api/admin/ppls', async (req, res) => {
	res.json(await readPpls());
});

app.post('/api/admin/ppls', async (req, res) => {
	const ppl = req.body;
	if (!validPpl(ppl)) {
		return res.status(400).json({ error: 'A record with a non-empty string id is required.' });
	}

	const ppls = await readPpls();
	if (ppls.some((item) => item.id === ppl.id)) {
		return res.status(409).json({ error: `A record with id "${ppl.id}" already exists.` });
	}

	ppls.push(ppl);
	await writePpls(ppls);
	res.status(201).json(ppl);
});

app.put('/api/admin/ppls/:id', async (req, res) => {
	const ppl = req.body;
	if (!validPpl(ppl) || ppl.id !== req.params.id) {
		return res.status(400).json({ error: 'The record id must match the id in the URL.' });
	}

	const ppls = await readPpls();
	const index = ppls.findIndex((item) => item.id === req.params.id);
	if (index === -1) {
		return res.status(404).json({ error: 'Record not found.' });
	}

	ppls[index] = ppl;
	await writePpls(ppls);
	res.json(ppl);
});

app.delete('/api/admin/ppls/:id', async (req, res) => {
	const ppls = await readPpls();
	const index = ppls.findIndex((item) => item.id === req.params.id);
	if (index === -1) {
		return res.status(404).json({ error: 'Record not found.' });
	}

	ppls.splice(index, 1);
	await writePpls(ppls);
	res.status(204).end();
});

app.get('/api/admin/plc', async (req, res) => {
	res.json(await readPlc());
});

app.post('/api/admin/plc', async (req, res) => {
	const record = req.body;
	if (!validPlcRecord(record)) {
		return res.status(400).json({ error: 'A place with a non-empty id and name is required.' });
	}
	record.id = record.id.trim();

	const plc = await readPlc();
	if (record.id && plc.some((item) => item.id === record.id)) {
		return res.status(409).json({ error: `A record with id "${record.id}" already exists.` });
	}

	plc.push(record);
	await writePlc(plc);
	res.status(201).json(record);
});

app.put('/api/admin/plc/:index', async (req, res) => {
	const index = parsePlcIndex(req.params.index);
	const record = req.body;
	if (!validPlcRecord(record)) {
		return res.status(400).json({ error: 'A place with a non-empty id and name is required.' });
	}
	record.id = record.id.trim();

	const plc = await readPlc();
	if (index < 0 || index >= plc.length) {
		return res.status(404).json({ error: 'Record not found.' });
	}
	if (record.id && plc.some((item, itemIndex) => itemIndex !== index && item.id === record.id)) {
		return res.status(409).json({ error: `A record with id "${record.id}" already exists.` });
	}

	plc[index] = record;
	await writePlc(plc);
	res.json(record);
});

app.delete('/api/admin/plc/:index', async (req, res) => {
	const index = parsePlcIndex(req.params.index);
	const plc = await readPlc();
	if (index < 0 || index >= plc.length) {
		return res.status(404).json({ error: 'Record not found.' });
	}

	plc.splice(index, 1);
	await writePlc(plc);
	res.status(204).end();
});

app.use(express.static(projectRoot));

app.listen(port, () => {
	console.log(`Admin server listening at http://localhost:${port}/backend/vadmin.html`);
});
