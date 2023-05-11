const express = require('express');
const { openBrowser, goto, write, click, closeBrowser, waitFor } = require('taiko');

const app = express();
const port = 5458;

let isBrowserOpen = false;
const requestQueue = [];

async function processRequest(req, res) {
    try {
        if (!isBrowserOpen) {
            isBrowserOpen = true;
            await openBrowser({ headless: false, args: ['--no-sandbox'] });
        }
        await goto('https://login.live.com/');
        await write(req.query.email);
        await click('next');
        await waitFor(2000); // Wait for page to load
        try {
            await click('Other ways to sign in');
            await waitFor(2000); // Wait for page to load
            await click(`Email ${req.query.email}`);
            await res.sendStatus(200);
        } catch (error) {
            console.log(`Unable to find Other ways to sign in or Email ${req.query.email}. Skipping...`);
            await res.sendStatus(204);
        }
        setTimeout(async () => {
            isBrowserOpen = false;
            await closeBrowser();
            const nextRequest = requestQueue.shift();
            if (nextRequest) {
                processRequest(nextRequest.req, nextRequest.res);
            }
        }, 4000);
    } catch (error) {
        console.log(error);
    }
}

app.get('/code', async (req, res) => {
    if (!req.query.email) return await res.sendStatus(400);
    if (isBrowserOpen) {
        requestQueue.push({ req, res });
        console.log(`Request queued: ${req.query.email}`);
    } else {
        console.log(`Processing request: ${req.query.email}`);
        processRequest(req, res);
    }
});

app.get('*', async (req, res) => {
    return await res.send('online');
});

app.listen(port, () => {
    console.log('Example app listening on port', port);
});
