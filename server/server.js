require('dotenv').config();

//PlantNet API Imports
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '../COMP-2800/dist');

//SECRETS
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
//END OF SECRETS

const corsOptions = {
	origin: ['http://localhost:5173'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer for handling file uploads for PlantNet API
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.get('/api', (req, res) => {
	res.json({ fruits: ['mango', 'apple'] });
});

// accept a single image file upload (field name: "image")
app.post('/plantIdentification', upload.single('image'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded (field name must be "image")' });
	}

	const filePath = req.file.path;
	const formData = new FormData();
	formData.append('organs', 'auto');
	formData.append('images', fs.createReadStream(filePath));

	const project = 'all';
	try {
		const headers = formData.getHeaders ? formData.getHeaders() : {};
		const response = await axios.post(
			`https://my-api.plantnet.org/v2/identify/${project}?api-key=${PLANTNET_API_KEY}`,
			formData,
			{ headers, maxContentLength: Infinity, maxBodyLength: Infinity }
		);

		const json = response.data;

		// cleanup uploaded file
		fs.unlink(filePath, err => {
			if (err) console.warn('Failed to remove temp upload:', err.message);
		});

		return res.json(json);
	} catch (error) {
		console.error('Error calling PlantNet API:', error);
		// cleanup uploaded file
		fs.unlink(filePath, err => {
			if (err) console.warn('Failed to remove temp upload:', err.message);
		});
		return res.status(500).json({ error: 'Identification failed' });
	}
});

//used specifically for backend.
app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}`);
});
