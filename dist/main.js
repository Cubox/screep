// Import role modules
var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleBuilder = require("role.builder");
var roleToRecycle = require("role.toRecycle");
var roleDistributor = require("role.distributor");
// Import spawn module
var spawn = require("spawn");

module.exports.loop = function () {
  // Clear memory of non-existing creeps
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log("Clearing non-existing creep memory:", name);
    }
  }

  // Spawn new creeps
  spawn();

  // Tower logic
  var towers = Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
    filter: (structure) => structure.structureType == STRUCTURE_TOWER,
  });
  for (var tower of towers) {
    // Find and repair closest damaged structure
    var closestDamagedStructure = tower.pos.findClosestByRange(
      FIND_STRUCTURES,
      {
        filter: (structure) =>
          (structure.structureType == STRUCTURE_ROAD || structure.my) &&
          structure.hits < structure.hitsMax * 0.75,
      }
    );
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }

    // Find and attack closest hostile creep
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }
  }

  Memory.cpuUsed = Game.cpu.getUsed();
  // Assign roles to creeps
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (Game.time % 100 === 0) {
      console.log(
        `Creep ${creep.name} used ${Game.cpu.getUsed() - Memory.cpuUsed} CPU`
      );
    }
    Memory.cpuUsed = Game.cpu.getUsed();

    var harvesters = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == "harvester"
    );
    if (creep.ticksToLive < creep.body.length * 15) {
      var closeSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
      if (closeSpawn) {
        creep.say("moving to renew");
        if (closeSpawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closeSpawn);
        }
      }
    } else if (harvesters.length <= 2) {
      if (creep.memory.role == "harvester" || creep.memory.role == "builder") {
        roleHarvester.run(creep);
      }
    } else {
      if (creep.memory.role == "harvester") {
        roleHarvester.run(creep);
      }
      if (creep.memory.role == "upgrader") {
        roleUpgrader.run(creep);
      }
      if (creep.memory.role == "builder") {
        roleBuilder.run(creep);
      }
      if (creep.memory.role == "distributor") {
        roleDistributor.run(creep);
      }
      if (creep.memory.role == "toRecycle") {
        roleToRecycle.run(creep);
      }
    }
  }
};
