var roleUpgrader = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // If the creep is upgrading and runs out of energy, switch to harvesting
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    // If the creep is not upgrading and has a full energy capacity, switch to upgrading
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    // If the creep is in upgrading mode
    if (creep.memory.upgrading) {
      // If the creep is not in range of the controller, move towards it
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
    } else {
      // Find the closest container with energy
      let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType == STRUCTURE_CONTAINER &&
          s.store[RESOURCE_ENERGY] > 0,
      });

      // If a container with energy is found
      if (container) {
        // If the creep is not in range to withdraw energy, move towards the container
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      } else {
        // Find the closest source
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        // If a source is found and the creep is not near it, move towards it
        if (source) {
          if (!creep.pos.isNearTo(source)) {
            creep.moveTo(source);
          }
          // If the creep is near the source, harvest energy from it
          else {
            creep.harvest(source);
          }
        }
      }
    }
  },
};

module.exports = roleUpgrader;
