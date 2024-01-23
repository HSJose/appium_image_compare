//import remote from webdriverio
import { remote } from 'webdriverio'
import dotenv from 'dotenv'
import readline from 'readline'
import looksSame from 'looks-same'

// Function to wait for keyboard input
const waitForEnter = () => {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('Press "Enter" to continue...');
        rl.on('line', () => {
            rl.close();
            resolve();
        });
    });
};

// Function to compare images with a threshold
function compareImages(image1Path, image2Path, threshold = 0.5) {
    return new Promise((resolve, reject) => {
        looksSame(image1Path, image2Path, { tolerance: threshold }, (error, { equal }) => {
            if (error) {
                reject(error);
            } else {
                resolve(equal);
            }
        });
    });
}

(async () => {

    // Read api key from .env file
    dotenv.config()
    const api_key = process.env.API_KEY
    const UDID = 'X02600RUALWE'

    const driver = await remote({
        protocol: 'https',
        hostname: 'appium-dev.headspin.io',
        port: 443,
        path: `/v0/${api_key}/wd/hub`,
        capabilities: {
            'appium:udid': UDID,
            // 'headspin:selector': 'device_skus:"ROKU"',
            'headspin:ControlLock': true,
            'appium:automationName': 'roku',
            'platformName': 'roku',
            'appium:keyCooldown': 250,
            'appium:newCommandTimeout': 300
        }
    })

    const delay = ms => new Promise(res => setTimeout(res, ms));

    let sess_id = driver.sessionId
    console.log(`This is the session ID ${sess_id}`)

    let driver_options = driver.options
    console.log('This is the OPTIONS property')
    console.log(driver_options)

    let appsList = await driver.execute('roku:getApps', [{}])
    console.log(appsList)

    // Load the dev channel Hero Grid
    await driver.execute('roku:activateApp', {'appId': 'dev'})
    await waitForEnter()

    // Get the page source for the Hero Grid
    let pageSource = await driver.getPageSource()
    console.log(pageSource)
    await waitForEnter()

    // Get the screen capture of the current screen
    await driver.saveScreenshot('Test_One.png')
    await waitForEnter()

    // Copare the screen capture with a baseline image
    let image1Path = './Baseline_One.png'
    let image2Path = './Test_One.png'

    console.log('Comparing the two images')
    const imagesAreSame = await compareImages(image1Path, image2Path)
    console.log('Are the two screenshots identical?', imagesAreSame);

    await driver.deleteSession()
})()
