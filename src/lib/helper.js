import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export class Helper {
    constructor() {}

    async fetchPuppeteeHTML(inURL) {
        if (inURL) {
            try {
                const browser = await puppeteer.launch({ 
                    headless: true, 
                    args: ["--no-sandbox", "--disable-setuid-sandbox"] 
                });
                const page = await browser.newPage();
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                );
                await page.goto(inURL, { waitUntil: "networkidle2", timeout: 60000 });
                const htmlData = await page.content();
                await browser.close();
                return htmlData;
            } catch (err) {
                throw new Error(`Issue in URL fetching - ${inURL}, Error - ${err}`);
            }
        }
    }
}
