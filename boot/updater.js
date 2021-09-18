const semver = require('semver')
const getTagFor = require('get-github-tag')
const download = require('download')

const extract = require('extract-zip')

let currentVersion
try {
    currentVersion = require('../metronami/package.json').version || '0.0.0'
} catch (e) {
    currentVersion = '0.0.0'
}
const chalk = require('chalk')

const fs = require('fs')

const ncp = require('ncp').ncp;
 ncp.limit = 16;

const getUpdate = () => {
    return new Promise((resolve) => {
        getTagFor('hiyamashu', 'Metronami', '').then(async (tag) => {
            const tagCleaned = semver.clean(tag)
            if (semver.lt(currentVersion, tagCleaned) === false) {
                // console.log(chalk.white('You are running the latest version of Metronami.'))
                return resolve(false)
            }

            // console.log(chalk.greenBright(`New update found: ${tag}`))

            // Url of the image
            const file = `https://github.com/hiyamashu/Metronami/archive/refs/tags/${tag}.zip`
            const filePath = `update`

            await download(file, filePath)
                .then(() => {
                    console.log(chalk.whiteBright(`Update downloaded: ${tag}`))
                })

            return resolve(tag)
        })
    })
}

const applyUpdate = (tag) => {
    return new Promise((resolve) => {
        // Copy save data
        ncp('metronami/data', 'update/ptn_backup', (err) => {
            // Delete the old files
            fs.rmdir('metronami', { recursive: true }, () => {
                const fileName = `Metronami-${tag.substring(1)}`
                // Unzip the file
                extract(`./update/${fileName}.zip`, { dir: `${__dirname}/../` })

                // Rename directory
                setTimeout(() => {
                    fs.rename(`${fileName}`, `metronami`, () => {
                        // Copy save files back
                        ncp('update/ptn_backup', 'metronami/data', (err) => {
                            return resolve()
                        })
                    })
                }, 3000)
            })
        });
    })
}

module.exports = {
    getUpdate,
    applyUpdate
}
