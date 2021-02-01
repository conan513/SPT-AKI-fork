/* check-version.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

const semver = require("semver");

if (semver.satisfies(process.version, "v12.18.2"))
{
    console.log("Your node version is correct.");
} else 
{
    console.log("Server requires node version v12.18.2");
    console.log(`Your version is ${process.version}`);
    if (globalThis.G_RELEASE_CONFIGURATION)
    {
        process.exit(1);
    }
    console.log("Dev build, continuing...");
}