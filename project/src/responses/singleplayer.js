/* singleplayer.js
 * contains responses for emutarkov singleplayer module requests
 * dependencies: EmuTarkov.Singleplayer
 */

function getWeaponDurability(url, info, sessionID)
{
    return response_f.noBody(gameplayConfig.inraid.saveWeaponDurability);
}

function getDefaultRaidSettings(url, info, sessionID)
{
    return response_f.noBody(gameplayConfig.defaultRaidSettings);
}

router.addDynamicRoute("/singleplayer/settings/weapon/durability/", getWeaponDurability);
router.addDynamicRoute("/singleplayer/settings/defaultRaidSettings/", getDefaultRaidSettings);