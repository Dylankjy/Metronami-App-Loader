const semver = require('semver')
const getTagFor = require('get-github-tag')
const download = require('download')

const extract = require('extract-zip')

const currentVersion = require('../metronami/package.json').version
const chalk = require('chalk')

const fs = require('fs')

const ncp = require('ncp').ncp;
 ncp.limit = 16;

const getUpdate = () => {
    return new Promise((resolve) => {
        getTagFor('hiyamashu', 'Metronami', '').then((tag) => {
            const tagCleaned = semver.clean(tag)
            if (semver.lt(currentVersion, tagCleaned) === false) {
                console.log(chalk.white('You are running the latest version of Metronami.'))
                return resolve(false)
            }

            console.log(chalk.greenBright(`New update found: ${tag}`))

            // Url of the image
            const file = `https://github.com/hiyamashu/Metronami/archive/refs/tags/${tag}.zip`
            const filePath = `update`

            download(file, filePath)
                .then(() => {
                    console.log(chalk.whiteBright('Update has been downloaded. You can access Metronami Settings to perform automatic system update.'))
                })

            return resolve(tag)
        })
    })
}

const applyUpdate = (tag) => {
    return new Promise((resolve) => {
        // Copy data
        ncp('../metronami/data', '../tmp-data', function (err) {
            if (err) {
              throw err
            }
        });

        // Delete the old files
        console.log('a')
        fs.rmdir('metronami', { recursive: true }, () => {
            console.log('a')
            const fileName = `Metronami-${tag.substring(1)}`
            // Unzip the file
            extract(`../update/${fileName}.zip`, { dir: `${__dirname}/../` })

            // Rename directory
            setTimeout(() => {
                console.log('a')
                fs.rename(`${fileName}`, `metronami`, () => {
                    return resolve()
                })
            }, 3000)
        })
    })
}

module.exports = {
    getUpdate,
    applyUpdate
}
