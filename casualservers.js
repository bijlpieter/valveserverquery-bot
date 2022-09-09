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

function isSTO(ip) { return ip.startsWith("155.133.252.") }
function isMAD(ip) { return ip.startsWith("155.133.246.") }
function isLAX(ip) { return false; }
function isVIR(ip) { return false; }
function isMWH(ip) { return ip.startsWith("155.133.254.") }
function isSGP(ip) { return ip.startsWith("103.10.124.") }
function isSNY(ip) { return ip.startsWith("103.10.125.") }
function isHKG(ip) { return ip.startsWith("153.254.86.") }
function isCHI(ip) { return ip.startsWith("155.133.249.") }
function isFRA(ip) { return ip.startsWith("155.133.226.") }
function isCHE(ip) { return ip.startsWith("155.133.232.") }
function isMUM(ip) { return ip.startsWith("155.133.233.") }
function isJHB(ip) { return ip.startsWith("155.133.238.") }
function isTKY(ip) { return ip.startsWith("155.133.239.") }
function isPER(ip) { return ip.startsWith("190.217.33.") }
function isBRA(ip) { return ip.startsWith("205.185.194.") }

function isNA(ip) {return isVIR(ip) || isLAX(ip) || isMWH(ip);}
function isEU(ip) {return isFRA(ip) || isSTO(ip) || isMAD(ip);}
function isAS(ip) {return isSGP(ip) || isTKY(ip) || isHKG(ip) || isMUM(ip) || isCHE(ip);}
function isSA(ip) {return isCHI(ip) || isPER(ip) || isBRA(ip);}
function isAF(ip) {return isJHB(ip);}
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
const FRANKFURT = 1;
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
const MUMBAI = 13;
const CHENNAI = 14;
const BRAZIL = 15;
const JOHANNESBURG = 16;

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
const locations = ["???", "fra", "sto", "mad", "vir", "lax", "mwh", "sgp", "tky", "hkg", "chi", "sny", "per", "bom", "che", "bra", "jhb"];
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
	if (isFRA(ip)) return locations[FRANKFURT];
	if (isSTO(ip)) return locations[STOCKHOLM];
	if (isMAD(ip)) return locations[MADRID];
	if (isSGP(ip)) return locations[SINGAPORE];
	if (isTKY(ip)) return locations[TOKYO];
	if (isHKG(ip)) return locations[HONGKONG];
	if (isCHI(ip)) return locations[CHILE];
	if (isSNY(ip)) return locations[SYDNEY];
	if (isPER(ip)) return locations[PERU];
	if (isJHB(ip)) return locations[JOHANNESBURG];
	if (isMUM(ip)) return locations[MUMBAI];
	if (isCHE(ip)) return locations[CHENNAI];
	if (isBRA(ip)) return locations[BRAZIL];
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
	loc: {isFRA, isSNY, isMWH, isBRA, isSTO, isMAD, isSGP, isTKY, isHKG, isCHI, isPER, isJHB, isMUM, isCHE},
	con: {isNA, isEU, isAS},
	get: {gamemode, continent, location},
	gamemodes, locations, continents
}

