var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.sourceId == undefined) {
            var sources = creep.room.find(FIND_SOURCES);
            for (var i in sources) {
                s = sources[i]
                creep.memory.sourceId = s.id
            }
        }

	    if (creep.store.getFreeCapacity() > 0) {
            var source = null
            if (creep.memory.sourceId) {
                source = Game.getObjectById(creep.memory.sourceId) 
            } else {
                source = creep.pos.findClosestByPath(FIND_SOURCES)
            }
            if (source) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                console.error("missing source")
            }
        } else {
            filter = function(structure) {
                return ((structure.structureType == STRUCTURE_EXTENSION || 
                    structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity() <= 0
                );
            }
            var targets = creep.room.find(FIND_STRUCTURES, {filter: filter});
            if(targets.length > 0) {
                rs = creep.transfer(targets[0], RESOURCE_ENERGY)
                if (rs == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;