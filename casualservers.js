function isAD(map) {return map == "cp_dustbowl" || map == "cp_egypt_final" || map.startsWith("cp_gorge") || map == "cp_gravelpit" || map == "cp_junction_final" || map == "cp_manor_event" || map == "cp_mercenarypark" || map == "cp_mossrock" || map == "cp_mountainlab" || map == "cp_steel";}
function isCTF(map) {return map.startsWith("ctf_") && !isMP(map);}
function isCP(map) {return map.startsWith("cp_") && !isAD(map) && !isMISC(map);}
function isKOTH(map) {return map.startsWith("koth_");}
function isPL(map) {return map.startsWith("pl_");}
function isPLR(map) {return map.startsWith("plr_");}
function isMISC(map) {return map == "tc_hydro" || map == "cp_degrootkeep" || map == "cp_snowplow" || map == "sd_doomsday";}
function isPD(map) {return map.startsWith("pd_");}
function isMP(map) {return map == "ctf_thundermountain" || map == "ctf_hellfire" || map == "ctf_foundry" || map == "ctf_gorge";}
function isPASS(map) {return map.startsWith("pass_");}
function isMVM(map) {return map.startsWith("mvm_");}

function isVIR(ip) {return ip.startsWith("208.78.164.") || ip.startsWith("208.78.165.") || ip.startsWith("208.78.166.") || ip.startsWith("162.254.192.");}
function isLAX(ip) {return ip.startsWith("162.254.194.");}
function isMWH(ip) {return ip.startsWith("192.69.97.");}
function isLUX(ip) {return ip.startsWith("146.66.152.") || ip.startsWith("146.66.153.") || ip.startsWith("146.66.158.") || ip.startsWith("146.66.159.") || ip.startsWith("155.133.240.") || ip.startsWith("155.133.241.") || ip.startsWith("155.133.226.");}
function isSTO(ip) {return ip.startsWith("146.66.156.") || ip.startsWith("146.66.157.") || ip.startsWith("155.133.242.") || ip.startsWith("155.133.243.") || ip.startsWith("185.25.180.") || ip.startsWith("185.25.181.");}
function isMAD(ip) {return ip.startsWith("155.133.247.");}
function isSGP(ip) {return ip.startsWith("103.28.54.") || ip.startsWith("103.28.55.") || ip.startsWith("45.121.184.") || ip.startsWith("45.121.185.");}
function isTKY(ip) {return ip.startsWith("45.121.186.") || ip.startsWith("45.121.187.");}
function isHKG(ip) {return ip.startsWith("155.133.244.");}
function isCHI(ip) {return ip.startsWith("155.133.249.");}
function isPER(ip) {return ip.startsWith("190.217.33.");}
function isSNY(ip) {return ip.startsWith("103.10.125.");}

function isNA(ip) {return isVIR(ip) || isLAX(ip) || isMWH(ip);}
function isEU(ip) {return isLUX(ip) || isSTO(ip) || isMAD(ip);}
function isAS(ip) {return isSGP(ip) || isTKY(ip) || isHKG(ip);}
function isSA(ip) {return isCHI(ip) || isPER(ip);}
function isAF(ip) {return false;}
function isOC(ip) {return isSNY(ip);}

const UNKNOWN = 0;
// Continents
const EUROPE = 1;
const NORTH_AMERICA = 2;
const SOUTH_AMERICA = 3;
const ASIA = 4;
const AFRICA = 5;
const OCEANIA = 6;

// Locations
const LUXEMBOURG = 1;
const STOCKHOLM = 2;
const MADRID = 3;
const VIRGINIA = 4;
const LOSANGELES = 5;
const WASHINGTON = 6;
const SINGAPORE = 7;
const TOKYO = 8;
const HONGKONG = 9;
const CHILE = 10;
const SYDNEY = 11;
const PERU = 12;

// Gamemodes
const ATTACK_DEFEND = 1;
const CAPTURE_THE_FLAG = 2;
const CONTROL_POINTS = 3;
const KING_OF_THE_HILL = 4;
const PAYLOAD = 5;
const PAYLOAD_RACE = 6;
const MISCELLANEOUS = 7;
const PLAYER_DESTRUCTION = 8;
const MANNPOWER = 9;
const PASSTIME = 10;
const MANN_VS_MACHINE = 11;

const continents = ["???", "eu", "na", "sa", "as", "af", "oc"];
const locations = ["???", "lux", "sto", "mad", "vir", "lax", "mwh", "sgp", "tky", "hkg", "chi", "sny", "per"];
const gamemodes = ["???", "ad", "ctf", "cp", "koth", "pl", "plr", "misc", "pd", "mp", "pass", "mvm"];

function continent(ip) {
	if (isNA(ip)) return continents[NORTH_AMERICA];
	if (isEU(ip)) return continents[EUROPE];
	if (isAS(ip)) return continents[ASIA];
	if (isAF(ip)) return continents[AFRICA];
	if (isSA(ip)) return continents[SOUTH_AMERICA];
	if (isOC(ip)) return continents[OCEANIA];
	return continents[UNKNOWN];
}

function location(ip) {
	if (isVIR(ip)) return locations[VIRGINIA];
	if (isLAX(ip)) return locations[LOSANGELES];
	if (isMWH(ip)) return locations[WASHINGTON];
	if (isLUX(ip)) return locations[LUXEMBOURG];
	if (isSTO(ip)) return locations[STOCKHOLM];
	if (isMAD(ip)) return locations[MADRID];
	if (isSGP(ip)) return locations[SINGAPORE];
	if (isTKY(ip)) return locations[TOKYO];
	if (isHKG(ip)) return locations[HONGKONG];
	if (isCHI(ip)) return locations[CHILE];
	if (isSNY(ip)) return locations[SYDNEY];
	if (isPER(ip)) return locations[PERU];
	return locations[UNKNOWN];
}

function gamemode(map) {
	if (isAD(map)) return gamemodes[ATTACK_DEFEND];
	if (isCTF(map)) return gamemodes[CAPTURE_THE_FLAG];
	if (isCP(map)) return gamemodes[CONTROL_POINTS];
	if (isKOTH(map)) return gamemodes[KING_OF_THE_HILL];
	if (isPL(map)) return gamemodes[PAYLOAD];
	if (isPLR(map)) return gamemodes[PAYLOAD_RACE];
	if (isMISC(map)) return gamemodes[MISCELLANEOUS];
	if (isPD(map)) return gamemodes[PLAYER_DESTRUCTION];
	if (isMP(map)) return gamemodes[MANNPOWER];
	if (isPASS(map)) return gamemodes[PASSTIME];
	if (isMVM(map)) return gamemodes[MANN_VS_MACHINE];
	return gamemodes[UNKNOWN];
}

module.exports = {
	gm: {isAD, isCTF, isCP, isKOTH, isPL, isPLR, isMISC, isPD, isMP, isPASS, isMVM},
	loc: {isVIR, isLAX, isMWH, isLUX, isSTO, isMAD, isSGP, isTKY, isHKG, isCHI, isPER},
	con: {isNA, isEU, isAS},
	get: {gamemode, continent, location},
	gamemodes, locations, continents
}

