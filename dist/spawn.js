function spawn() {
  var creepUnits = {
    harvester: {
      work: 3,
      carry: 4,
      move: 3,
    },
    upgrader: {
      work: 3,
      carry: 4,
      move: 3,
    },
    builder: {
      work: 3,
      carry: 4,
      move: 3,
    },
    distributor: {
      carry: 6,
      move: 4,
    },
  };

  for (var role in creepUnits) {
    var bodyParts = [];
    for (var part in creepUnits[role]) {
      for (var i = 0; i < creepUnits[role][part]; i++) {
        bodyParts.push(part.toUpperCase());
      }
    }
    creepUnits[role] = bodyParts;
  }

  var roles = ["harvester", "upgrader", "builder", "distributor"];
  var minCounts = {
    harvester: 6,
    upgrader: 2,
    builder: 4,
    distributor: 4,
  };

  // Loop through each role
  for (var role of roles) {
    // Count the number of creeps with the current role
    var count = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == role
    ).length;
    // Get the minimum count for the current role
    var minCount = minCounts[role];

    // If there are less creeps than the minimum count
    if (count < minCount) {
      // Get the existing creep numbers
      var existingCreepNumbers = Object.values(Game.creeps).map((creep) =>
        parseInt(creep.name.replace(/\D/g, ""))
      );
      var newNumber;
      // Generate a new unique number for the creep
      do {
        newNumber = Math.floor(Math.random() * 20) + 1;
      } while (existingCreepNumbers.includes(newNumber));
      // Create a new name for the creep
      var newName = role.charAt(0).toUpperCase() + role.slice(1) + newNumber;

      // Get the maximum energy available in the spawn's room
      var maxEnergy = Game.spawns["Spawn1"].room.energyCapacityAvailable;
      // Get the body parts for the current role
      var creepParts = creepUnits[role];
      // Calculate the cost of the creep
      var creepCost = _.sum(creepParts, (part) => BODYPART_COST[part]);

      // While the cost is greater than the maximum energy, reduce the most expensive body part
      while (creepCost > maxEnergy) {
        var maxCostPart = _.maxBy(creepParts, (part) => BODYPART_COST[part]);
        var maxCostPartCount = _.countBy(creepParts)[maxCostPart];
        if (maxCostPartCount > 1) {
          var maxCostPartIndex = creepParts.indexOf(maxCostPart);
          creepParts.splice(maxCostPartIndex, 1);
          creepCost = _.sum(creepParts, (part) => BODYPART_COST[part]);
        } else {
          break;
        }
      }

      // Spawn the new creep
      var spawnResult = Game.spawns["Spawn1"].spawnCreep(creepParts, newName, {
        memory: { role: role },
      });

      // If the spawn was successful, log it and break out of the loop
      if (spawnResult == OK) {
        console.log("Spawning new " + role + ": " + newName);
        break;
      } else {
        console.log(
          "Failed to spawn new " +
            role +
            ": " +
            newName +
            " (" +
            spawnResult +
            ")"
        );
      }
    }
  }

  if (Game.spawns["Spawn1"].spawning) {
    var spawningCreep = Game.creeps[Game.spawns["Spawn1"].spawning.name];
    Game.spawns["Spawn1"].room.visual.text(
      "🛠️" + spawningCreep.memory.role,
      Game.spawns["Spawn1"].pos.x + 1,
      Game.spawns["Spawn1"].pos.y,
      { align: "left", opacity: 0.8 }
    );
  }
}

module.exports = spawn;
