import { chromium } from 'playwright';

// Configuration
const BASE_URL = 'http://localhost:3000';
const PAGES_TO_TEST = [
    { name: 'Hosting List', url: '/en/hosting', waitForSelector: 'a:has-text("View Exclusive Deal")' },
    { name: 'VPN List', url: '/en/vpn', waitForSelector: 'a:has-text("View Exclusive Deal")' },
    { name: 'Hosting Detail', url: '/en/hosting/hostinger', waitForSelector: 'a:has-text("Visit")' },
    { name: 'VPN Detail', url: '/en/vpn/nordvpn', waitForSelector: 'a:has-text("Visit")' },
    { name: 'Compare Section', url: '/en/compare', waitForSelector: 'a:has-text("Get Verified Offer")' },
    { name: 'Calculator Tool', url: '/en/calculator', waitForSelector: 'a:has-text("Switch to")' },
    { name: 'News List', url: '/en/news', waitForSelector: 'a:has-text("Check Deal")' },
];

async function runTests() {
    console.log('🚀 Starting Sitewide Affiliate Button Tests...\n');
    let hasErrors = false;
    
    // Launch Chrome
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const testCase of PAGES_TO_TEST) {
        console.log(`Testing: ${testCase.name} (${BASE_URL}${testCase.url})`);
        try {
            await page.goto(`${BASE_URL}${testCase.url}`, { waitUntil: 'networkidle' });
            
            // For calculators and comparators, give React a second to run its useEffects
            if (testCase.name.includes('Calculator') || testCase.name.includes('Compare')) {
                await page.waitForTimeout(2000);
            }

            // Wait for the button
            await page.waitForSelector(testCase.waitForSelector, { timeout: 10000 });
            
            // Get all buttons on the page matching the selector
            const locators = page.locator(testCase.waitForSelector);
            const count = await locators.count();
            
            if (count === 0) {
                console.error(`❌ FAILED: No affiliate buttons found for '${testCase.name}'`);
                hasErrors = true;
                continue;
            }

            console.log(`✅ Found ${count} affiliate buttons.`);

            // Verify visibility & clickability by trying to hover
            const firstLocator = locators.first();
            try {
                await firstLocator.hover({ timeout: 5000 });
                console.log(`✅ First button is visible and hoverable.`);
            } catch (err: any) {
                console.error(`❌ FAILED: Button is obstructed or not hoverable: ${err.message}`);
                hasErrors = true;
            }

            // Check first button's href
            const firstHref = await firstLocator.getAttribute('href');
            if (!firstHref) {
                console.error(`❌ FAILED: Button has no href attribute`);
                hasErrors = true;
            } else if (firstHref === '#' || firstHref.startsWith('/')) {
                console.error(`❌ FAILED: Button has local or empty href (${firstHref})`);
                hasErrors = true;
            } else {
                console.log(`✅ Valid URL format: ${firstHref}`);
            }

        } catch (error: any) {
            console.error(`❌ FAILED: ${error.message}`);
            hasErrors = true;
        }
        console.log('--------------------------------------------------');
    }

    await browser.close();

    if (hasErrors) {
        console.error('\n❌ Tests finished with errors.');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed successfully!');
        process.exit(0);
    }
}

runTests().catch(console.error);
