var _ = require('lodash');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var behaviors = {
    "harvester": roleHarvester,
    "upgrader": roleUpgrader,
    "builder": roleBuilder,
}

module.exports.loop = function () {
    // if (Memory.sources == undefined) {
    //     Memory.sources = {};
    // }
    // Source.prototype.memory = Memory.sources[this.id];

    init()
    var group = creepsGrouped()
    var harvesters = group['harvester']
    var upgraders = group['upgrader']
    var builder = group['builder']
    var base1 = Game.spawns['Spawn1']
    if (!base1) {
        console.log("missing Spawn1")
        return
    }
    if(harvesters.length < 3) {
        spawnCreep(base1, "harvester", [WORK,CARRY,MOVE,MOVE])
    }
    if(upgraders.length < 3) {
        spawnCreep(base1, "upgrader", [WORK,CARRY,MOVE])
    }
    var creepsCount = 0
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        behaviors[creep.memory.role].run(creep)
        creepsCount++
    }
    // console.log(`screeps: ${creepsCount} haverst: ${harvesters.length} builder: ${builder.length} upgrader: ${upgraders.length}`)
}


function spawnCreep(spawn, role, caps) {
    if (spawn.spawning) {
        creep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + creep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
        return
    }
    if (!caps) {
        console.error("spawn creeps: invliad caps")
        return
    }
    var name = role + Game.time;
    rs = spawn.spawnCreep(caps, name, {memory: {role: role}});
    if (rs != 0) {
        return false
    }
    console.log(`spawning new ${role}: ${name} result:${rs}`);
    return true
}


function creepsGrouped() {
    var group = {
        "harvester": [],
        "upgrader": [],
        "builder": []
    }
    for(var name in Memory.creeps) {
        creep = Game.creeps[name]
        if(!creep) {
            delete Memory.creeps[name];
            console.log(`clearing non-existing creep memory: ${name}`);
            continue
        }
        group[creep.memory.role].push(creep)
    }
    return group
}

function init(version=1) {
    for (const [name, spawn] of Object.entries(Game.spawns)) {
        // console.log(`init room of spawn ${spawn.name}`)
        init_room(spawn.room, version)
    }
}

function init_room(room, version=1) {
    if (room.memory.initialized == version) {
        return
    }
    console.log(`init room ${room.name}`)
    var sources = room.find(FIND_SOURCES); 
    room.memory.sourceCount = sources.length

    // init sources
    console.log(`init sources ${sources}`)
    sources = room.find(FIND_SOURCES)
    sourceMemory = {}
    for (const i in sources) {
        var s = sources[i]
        var m = create_source_extras(s)
        sourceMemory[s.id] = m
        // s.memory.maxWorkers = m.maxWorkers
    }
    room.memory.source = sourceMemory
    room.memory.initialized = version
}

function create_source_extras(source) {
    maxWorkers = 0
    pos = source.pos
    terrains = source.room.getTerrain()
    for (const arr in [[0,1], [1,1], [1,0], [1,-1], [0,-1], [-1,-1], [-1,0], [-1,1]]) {
        a = arr[0]
        b = arr[1]
        block = terrains.get(pos.x+a, pos.y+b) 
        if (block == 0) {
            maxWorkers++
        }
    }
    return {
        maxWorkers: maxWorkers
    }
}