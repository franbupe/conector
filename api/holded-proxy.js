const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const endpoint = `https://api.holded.com/api/projects/v1${req.url}`; // URL base de la API de Holded
    const response = await fetch(endpoint, {
        method: req.method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'key': process.env.HOLDED_API_KEY // La API Key se almacena como variable de entorno en Vercel
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // Establece la respuesta CORS para permitir el acceso desde tu dominio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const data = await response.json();
    res.json(data);
};
