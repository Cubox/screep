var roleDistributor = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // If the creep has free capacity in its store
    if (creep.store.getFreeCapacity() > 0) {
      // Find dropped energy on the ground
      var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (resource) =>
          resource.resourceType == RESOURCE_ENERGY &&
          !_.any(Game.creeps, (c) => c.memory.targetResource == resource.id),
      });
      if (droppedEnergy) {
        creep.memory.targetResource = droppedEnergy.id;
        if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedEnergy, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        } else {
          delete creep.memory.targetResource;
        }
      } else {
        // Find the closest container with available energy
        var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) =>
            structure.structureType == STRUCTURE_CONTAINER &&
            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
        });
        if (container) {
          // Withdraw energy from the container, move to it if not in range
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {
              visualizePathStyle: { stroke: "#ffaa00" },
            });
          }
        }
      }
    } else {
      // If the creep's store is full, find structures that need energy
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });
      // If there are structures that need energy
      if (targets.length > 0) {
        // Find the structure with the least amount of energy
        var target = _.min(targets, (structure) =>
          structure.store.getFreeCapacity(RESOURCE_ENERGY)
        );
        // Transfer energy to the target structure, move to it if not in range
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      }
    }
  },
};

module.exports = roleDistributor;
