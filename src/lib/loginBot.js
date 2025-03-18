import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export class LoginBot {
    browser = null;
    page = null;
    urlToBeFetched = "https://www.linkedin.com/login";

    async _initializeBrowser() {
        this.browser = await puppeteer.launch({
            headless: false, // Change to true in production
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        console.log("Initialized browser");
    }

    async _closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async fetchPuppeteerHTML() {
        try {
            await this._initializeBrowser();
            this.page = await this.browser.newPage();

            // SET CUSTOM HEADERS
            await this.page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            );
            await this.page.setExtraHTTPHeaders({
                "accept-language": "en-US,en;q=0.9",
                "upgrade-insecure-requests": "1",
            });

            // RETRY ON CONNECTION RESET
            await retry(() =>
                this.page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle2", timeout: 90000 })
            );

            if (this.page.url().includes("/feed/")) {
                console.log("User is already logged in.");
                return true;
            }

            console.log("Not logged in, navigating to login page...");
            await this.page.goto(this.urlToBeFetched, { waitUntil: "networkidle2", timeout: 90000 });

            await this.page.waitForSelector("#username", { timeout: 15000 });
            await this.page.type("#username", "your_username");

            await this.page.waitForSelector("#password", { timeout: 15000 });
            await this.page.type("#password", "your_password");

            await this.page.waitForSelector('button[type="submit"]', { timeout: 15000 });
            await this.page.click('button[type="submit"]');
            await this.page.waitForNavigation({ waitUntil: "networkidle2" });

            console.log("Login successful...");


            return true;
        } catch (err) {
            throw new Error(`Issue in URL fetching - ${this.urlToBeFetched}, Error - ${err}`);
        }
    }

    async getProfileName() {
        if (!this.page) {
            throw new Error("Page is not initialized. Call fetchPuppeteerHTML() first.");
        }
    
        try {
            // Ensure we're on the LinkedIn feed/profile page
            if (!this.page.url().includes("/feed/") && !this.page.url().includes("/in/")) {
                await this.page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle2" });
            }
    
            // Multiple selectors to ensure we find the correct element
            const selectors = [
                "div.display-flex mt1",
                "h3.profile-card-name text-heading-large"
            ];
    
            let profileName = null;
    
            for (const selector of selectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 10000 });
                    profileName = await this.page.$eval(selector, el => el.innerText.trim());
                    if (profileName) break; // Stop if we found the name
                } catch (err) {
                    console.log(`Selector not found: ${selector}`);
                }
            }
    
            if (!profileName) throw new Error("Profile name not found.");
            console.log("Extracted Profile Name:", profileName);
            return profileName;
    
        } catch (err) {
            throw new Error(`Error fetching profile name: ${err}`);
        } finally {
            await this._closeBrowser();
        }
    }
}

async function retry(fn, retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`Retrying... Attempt ${i + 1}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("Failed after multiple attempts");
}