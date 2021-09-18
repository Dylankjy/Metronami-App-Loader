const execa = require('execa')

// Updater
const chalk = require('chalk');
const { getUpdate, applyUpdate } = require('./updater');

const currentMetronamiVersion = require('../metronami/package.json').version

(async () => {
    // For new installs
    if (currentMetronamiVersion === '0.0.0') {
        console.log(chalk.red('[LOADER] New installation detected. Downloading additional files...'))

        const getCurrentVersion = await getUpdate()
        
        await applyUpdate(getCurrentVersion)
        console.log(chalk.green(`[LOADER] Metronami ${getCurrentVersion} has been installed.`))
    }

    while (true) {
        try {
            const { stdout } = await execa('npm run app-start', { stdio: 'inherit' })
        } catch (exitData) {
            // Otherwise, restart the process
            if (exitData.exitCode === -10) {
                console.log('[LOADER] Restart requested')
                continue
            }

            // Update mode
            if (exitData.exitCode === -11) {
                
            }

            // If the process exited with a non-zero code and it isn't the restart signal
            // then close the process and exit the loop
            if (exitData.exitCode !== 0) {
               throw exitData
            }

            // Otherwise, close process
            process.exit(0)
        }
    }
})()
