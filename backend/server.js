const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const projectRoot = path.join(__dirname, '..');
const dataFile = path.join(projectRoot, 'data', 'ppls.json');
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

function validPpl(ppl) {
	return ppl && typeof ppl === 'object' && !Array.isArray(ppl) &&
		typeof ppl.id === 'string' && ppl.id.trim().length > 0;
}

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

app.use(express.static(projectRoot));

app.listen(port, () => {
	console.log(`Admin server listening at http://localhost:${port}/backend/admin.html`);
});
