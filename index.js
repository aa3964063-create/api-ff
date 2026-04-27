const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/check', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send({ error: "Falta el ID" });

    let browser;
    try {
        // Configuración especial para que no consuma mucha RAM en el celular/servidor
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        
        // 1. Entrar a la página (Ejemplo: Pagostore)
        await page.goto('https://pagostore.com/app/100067/buy/0', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        // 2. Escribir el ID del cliente
        await page.waitForSelector('input[name="player_id"]');
        await page.type('input[name="player_id"]', id);
        
        // 3. Click en el botón de entrar
        await page.click('button.btn-login'); 

        // 4. Esperar a que el nombre aparezca en pantalla
        // Nota: Si el sitio cambia de diseño, el ".user-nickname" podría cambiar
        await page.waitForSelector('.user-nickname', { timeout: 10000 });
        const name = await page.$eval('.user-nickname', el => el.innerText);

        await browser.close();
        
        // Enviar el resultado al cliente
        res.json({ 
            success: true,
            id: id, 
            nombre: name 
        });

    } catch (e) {
        if (browser) await browser.close();
        res.status(500).json({ 
            success: false, 
            error: "ID no encontrado o tiempo de espera agotado" 
        });
    }
});

app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
