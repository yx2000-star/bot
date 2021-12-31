const puppeteer = require('puppeteer')

    async function launchBrowser() {
        let browser;
        try {
            console.log('opening browser... ')
            browser = await puppeteer.launch({
                headless: false,
                args: ['--disable-setuid-sandbox'],
                ignoreHTTPSErrors: true,
            });
        } catch (err) {
            console.log('could not create a browser instance => : ', err)
        }
        return browser
    }

    module.exports = {launchBrowser}