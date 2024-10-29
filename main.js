import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'

// Lista de palabras clave para buscar
const keywords = [
    "empresa desarrollo software peru",
    "servicios desarrollo software empresas",
    "desarrollo software empresarial",
    "consultora desarrollo software"
];

// Headers para evitar bloqueos
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function searchGoogle(keyword) {
    try {
        // Construimos la URL de búsqueda con la keyword codificada
        const baseUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

        // Hacemos la petición a Google
        const response = await axios.get(baseUrl, { headers });

        // Cargamos el HTML en cheerio para poder parsearlo
        const $ = cheerio.load(response.data);

        // Usamos Set para evitar URLs duplicadas
        const urls = new Set();

        // Buscamos todos los enlaces en los resultados de búsqueda
        $('div.g a').each((_, element) => {
            const url = $(element).attr('href');
            // Solo guardamos URLs que empiecen con http
            if (url?.startsWith('http')) {
                urls.add(url);
            }
        });

        return Array.from(urls);
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function execute() {
    try {
        // Set para almacenar todas las URLs encontradas
        const allUrls = new Set();

        // Iteramos sobre cada palabra clave
        for (const keyword of keywords) {
            console.log(`Buscando: ${keyword}`);

            // Buscamos URLs para esta keyword
            const urls = await searchGoogle(keyword);

            // Añadimos las URLs encontradas al Set principal
            urls.forEach(url => allUrls.add(url));

            // Esperamos 2 segundos entre búsquedas para evitar ser bloqueados
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Preparamos el contenido del archivo CSV
        const csvContent = Array.from(allUrls).join('\n');

        // Creamos un nombre de archivo con la fecha actual
        const filename = `urls_${new Date().toISOString().slice(0,10)}.csv`;

        // Guardamos las urls en un archivo
        await fs.writeFile(filename, csvContent);
        console.log(`URLs guardadas en: ${filename}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Iniciamos la ejecución
execute();