// Plain-English meanings for technical drilling terms.
// Shown to non-engineer users in the "Why?" explanation panel.

const featureDictionary = {
  ROP: "Drilling speed",
  WOB: "Downward force on the drill bit",
  RPM: "Drill spin speed",
  Torque: "Twisting force on the drill",
  Standpipe_Pressure: "Pressure of fluid pumped down the well",
  Flow_Rate: "How fast drilling fluid is pumped",
  Mud_Weight: "Heaviness of the drilling fluid",
  Plastic_Viscosity: "Thickness of the drilling fluid",
  Yield_Point: "Fluid's ability to carry rock bits to the surface",
  Hook_Load: "Weight held up by the rig",
  Inclination: "How much the well bends from vertical",
  Reservoir_Pressure: "Natural pressure inside the rock",
  Formation_Pore_Pressure: "Pressure of fluid trapped in the rock",
  Distance_To_Nearest_Offset_m: "Distance to the nearest other well",
  Historical_Event_Count: "Past incidents recorded near this spot",
  Depth_MD: "Total depth drilled so far",
  Depth_TVD: "Straight-down depth below surface",
  Hour: "Time of day this reading was taken",
  Day: "Day of the month this reading was taken",
  Month: "Month this reading was taken",
};

export function translateFeatureName(rawName) {
  if (featureDictionary[rawName]) return featureDictionary[rawName];

  if (rawName.startsWith("Formation_")) {
    const formationName = rawName.replace("Formation_", "").replace(/_/g, " ");
    return `Rock type: ${formationName}`;
  }
  if (rawName.startsWith("Bit_Type_")) {
    const bitName = rawName.replace("Bit_Type_", "").replace(/_/g, " ");
    return `Drill bit: ${bitName}`;
  }

  return rawName.replace(/_/g, " ");
}

export default featureDictionary;