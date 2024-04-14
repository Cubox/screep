var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // If the creep is currently building and has no energy left, switch to harvesting
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    // If the creep is not building and has a full energy capacity, switch to building
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    // If the creep is in building mode
    if (creep.memory.building) {
      // Find structures that need repair (roads or owned structures with less than 75% hits)
      var structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
          (structure.structureType == STRUCTURE_ROAD || structure.my) &&
          structure.hits < structure.hitsMax * 0.75,
      });
      // If there are structures to repair
      if (structures.length) {
        // Move to the structure and repair it
        if (creep.repair(structures[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structures[0], {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      } else {
        // Find construction sites
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        // If there are construction sites
        if (targets.length) {
          // Move to the construction site and build it
          if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {
              visualizePathStyle: { stroke: "#ffffff" },
            });
          }
        } else {
          // If no construction sites or structures to repair, upgrade the controller
          /* if (
            creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE
          ) {
            creep.moveTo(creep.room.controller, {
              visualizePathStyle: { stroke: "#ffffff" },
            });
          } */
        }
      }
    } else {
      // Find the closest container, storage, or dropped resource with energy
      var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) =>
          (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
          structure.store[RESOURCE_ENERGY] > 0,
      });

      if (!target) {
        target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
          filter: (resource) => resource.resourceType == RESOURCE_ENERGY,
        });
      }

      // If a target is found
      if (target) {
        // Move to the target and withdraw energy
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      }
    }
  },
};

module.exports = roleBuilder;
