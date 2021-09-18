const execa = require('execa')

// Updater
const chalk = require('chalk')
const { getUpdate, applyUpdate } = require('./boot/updater')

const open = require('open')

let currentVersion
try {
    currentVersion = require('./metronami/package.json').version
} catch (e) {
    currentVersion = '0.0.0'
}

let launchBrowser = true;

(async () => {
    // For new installs
    if (currentVersion === '0.0.0') {
        console.log(chalk.red('[LOADER] New installation detected. Downloading additional files...'))

        await getUpdate().then(async (latestTag) => {
            await applyUpdate(latestTag)
            console.log(chalk.green(`[LOADER] Metronami ${latestTag} has been installed.`))
        })
    }

    // 2 seconds delay before starting child
    setTimeout(async () => {
        while (true) {
            try {
                if (launchBrowser === true) {
                    launchBrowser = false
                    setTimeout(() => {
                        console.log(`${chalk.whiteBright('Launching Metronami in your browser... If the page does not load, give it awhile and refresh the page.')}`)
                        open(`http://localhost:36554`)

                        setTimeout(() => {
                            console.log(`${chalk.cyan('Nothing happened? ')}${chalk.whiteBright(`Type http://localhost:36554 in your web browser's address bar to access Metronami.`)}`)
                        }, 5000)
                    }, 8000)
                }
                const { stdout } = await execa('npm run app-start', { stdio: 'inherit' })
            } catch (exitData) {
                if (exitData.exitCode === 0) {
                    process.exit()
                }

                // 200 = Restart signal
                if (exitData.exitCode === 200) {
                    console.log('[LOADER] Restart requested')
                    continue
                }

                // 201 - Update mode
                if (exitData.exitCode === 201) {
                    const getCurrentVersion = await getUpdate()
                    await applyUpdate(getCurrentVersion)
                    continue
                }

                throw exitData
            }
        }
    }, 2000)
})()
