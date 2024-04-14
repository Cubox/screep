/**
 * A role for a creep that recycles itself.
 * The creep will move to the closest spawn and recycle itself when near the spawn.
 */
var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // Find the closest spawn
    var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);

    // If the creep is near the spawn, recycle it
    if (creep.pos.isNearTo(spawn)) {
      spawn.recycleCreep(creep);
    } else {
      // Otherwise, move towards the spawn
      creep.moveTo(spawn);
    }
  },
};

module.exports = roleHarvester;
