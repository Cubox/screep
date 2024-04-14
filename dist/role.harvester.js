var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // Check if the creep doesn't have a sourceId assigned in its memory
    if (!creep.memory.sourceId) {
      // Find all sources in the room
      var sources = creep.room.find(FIND_SOURCES);
      // Filter all creeps with the role 'harvester'
      var harvesters = _.filter(
        Game.creeps,
        (creep) => creep.memory.role == "harvester"
      );
      // Count harvesters assigned to each source
      var sourceCounts = sources.map((source) => ({
        id: source.id,
        count: _.filter(
          harvesters,
          (creep) => creep.memory.sourceId == source.id
        ).length,
      }));
      // Find the source with the least number of assigned harvesters
      var leastAssignedSource = sourceCounts.reduce((min, source) =>
        source.count < min.count ? source : min
      );
      creep.memory.sourceId = leastAssignedSource.id;
    }

    if (creep.store.getFreeCapacity() > 0) {
      var source = Game.getObjectById(creep.memory.sourceId);

      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {
          visualizePathStyle: { stroke: "#ffaa00" },
        });
      }
    } else {
      // If the creep's store is full, find the closest container with available capacity
      var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) =>
          structure.structureType == STRUCTURE_CONTAINER &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });

      // If a container is found
      if (container) {
        // Try to transfer energy to the container
        if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // If not in range, move towards the container
          creep.moveTo(container, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      } else {
        // If no container is found or all are full, move to a position near the source
        var source = Game.getObjectById(creep.memory.sourceId);
        // Find a position in a 3x3 area around the source that is not a wall or occupied
        var newPos = source.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => structure.structureType == STRUCTURE_ROAD,
        });

        if (newPos) {
          // Move to the nearby position
          creep.moveTo(newPos);
        } else {
          // If no valid position found, move to the source
          creep.moveTo(source);
        }
      }
    }
  },
};

module.exports = roleHarvester;
