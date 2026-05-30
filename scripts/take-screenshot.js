import { chromium } from "playwright";
import { join } from "path";

async function run() {
	console.log("Starting browser...");
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	
	// Thiết lập kích thước cửa sổ chuẩn Desktop
	await page.setViewportSize({ width: 1280, height: 850 });
	
	const url = "http://localhost:4321/";
	console.log(`Navigating to ${url}...`);
	
	try {
		await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
		
		// Đợi thêm 2 giây để thanh Trending Ticker chạy mượt mà và ảnh load hẳn
		await page.waitForTimeout(2000);
		
		const screenshotPath = "/Users/mun/.gemini/antigravity/brain/c6b9b2c7-d8ea-40e7-a998-ad22cae1a78a/screenshot.png";
		console.log(`Taking screenshot... Saving to: ${screenshotPath}`);
		
		await page.screenshot({ path: screenshotPath });
		console.log("Screenshot saved successfully!");
	} catch (err) {
		console.error("Error during navigation or screenshot:", err);
	} finally {
		await browser.close();
		console.log("Browser closed.");
	}
}

run();
