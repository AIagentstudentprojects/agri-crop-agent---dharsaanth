import {
  CropProfile,
  CropCategory,
  LifeCycleStageName,
  GrowthStage,
} from '../types';
import { CEREAL_CROPS } from './crops/cereals';
import { VEGETABLE_CROPS } from './crops/vegetables';
import { CASH_AND_COMMERCIAL_CROPS } from './crops/cashAndCommercial';
import { PULSES_AND_OILSEEDS_CROPS } from './crops/pulsesAndOilseeds';
import { FRUIT_CROPS } from './crops/fruits';

// Aggregate comprehensive multi-domain agronomic catalog, deduplicated by ID to guarantee unique React keys
const RAW_CROPS: CropProfile[] = [
  ...CEREAL_CROPS,
  ...VEGETABLE_CROPS,
  ...FRUIT_CROPS,
  ...CASH_AND_COMMERCIAL_CROPS,
  ...PULSES_AND_OILSEEDS_CROPS,
];

export const CROP_CATALOG: CropProfile[] = Array.from(
  new Map(RAW_CROPS.map((crop) => [crop.id, crop])).values()
);

// Bidirectional mapping between lifecycle stages and main farm inputs growth stages
export function mapLifecycleToGrowthStage(lifecycleStage: LifeCycleStageName): GrowthStage {
  switch (lifecycleStage) {
    case 'Land Preparation':
    case 'Seed Selection':
    case 'Seed Sowing / Planting':
      return 'Land Preparation / Sowing';
    case 'Germination':
    case 'Early Growth':
      return 'Germination / Seedling';
    case 'Vegetative Stage':
      return 'Vegetative Growth';
    case 'Flowering Stage':
      return 'Flowering & Pollination';
    case 'Fruit / Vegetable Development':
      return 'Fruiting / Grain Formation';
    case 'Maturity':
    case 'Harvest':
      return 'Maturity / Harvesting';
    default:
      return 'Vegetative Growth';
  }
}

export function mapGrowthStageToLifecycle(growthStage: GrowthStage): LifeCycleStageName {
  switch (growthStage) {
    case 'Land Preparation / Sowing':
      return 'Seed Sowing / Planting';
    case 'Germination / Seedling':
      return 'Early Growth';
    case 'Vegetative Growth':
      return 'Vegetative Stage';
    case 'Flowering & Pollination':
      return 'Flowering Stage';
    case 'Fruiting / Grain Formation':
      return 'Fruit / Vegetable Development';
    case 'Maturity / Harvesting':
      return 'Maturity';
    default:
      return 'Vegetative Stage';
  }
}

// Helper to find crop by id or partial name match
export function findCropProfile(query: string): CropProfile | undefined {
  if (!query) return CROP_CATALOG[0];
  const q = query.toLowerCase().trim();
  const direct = CROP_CATALOG.find(
    (c) => c.id === q || c.name.toLowerCase() === q || c.name.toLowerCase().includes(q)
  );
  if (direct) return direct;
  return CROP_CATALOG.find((c) => q.includes(c.id) || q.includes(c.name.toLowerCase().split(' ')[0]));
}

// Automatically estimate growth stage based on Days After Planting (DAP)
export function estimateGrowthStageFromDap(crop: CropProfile, dap: number): LifeCycleStageName {
  if (dap <= 0) return 'Land Preparation';
  const match = crop.stages.find((s) => dap >= s.dayStart && dap <= s.dayEnd);
  if (match) return match.stageName;
  if (dap > crop.totalDurationDays) return 'Harvest';
  return crop.stages[crop.stages.length - 1].stageName;
}

// Generate an agronomic fallback profile for any custom user crop
export function generateCustomCropProfile(cropName: string, category: CropCategory = 'Vegetable'): CropProfile {
  const cleanName = cropName.trim() || 'Custom Farm Crop';
  return {
    id: cleanName.toLowerCase().replace(/\s+/g, '-'),
    name: cleanName,
    scientificName: `${cleanName} spp.`,
    category,
    suitableClimate: 'Subtropical to tropical climate with moderate seasonal rainfall, good sunshine, and temperate windows.',
    suitableSoilTypes: ['Loamy', 'Clay Loam', 'Sandy Loam'],
    approximateGrowingDuration: '90 - 120 days',
    totalDurationDays: 105,
    importantEnvironmentalConditions: {
      optimalTemperature: '20°C - 30°C',
      humidity: '55% - 75%',
      sunlight: '6 - 8 hours of clear daylight',
      waterRequirementLevel: 'Moderate',
      soilPh: '6.0 - 7.2',
    },
    expectedHarvestStage: {
      indicators: [
        'Optimal market size and physiological maturity reached',
        'Characteristic color and skin firmness developed',
        'Foliage starts showing natural maturity yellowing',
      ],
      harvestWindow: '10 - 14 days upon reaching maturity',
      postHarvestTip: 'Grade and store in cool, shaded, well-ventilated packing areas away from direct solar radiation.',
    },
    stages: [
      {
        stageName: 'Land Preparation',
        stageNumber: 1,
        dayRange: 'Days -14 to 0',
        dayStart: -14,
        dayEnd: 0,
        whatHappens: `Soil is plowed, disced, and leveled to prepare a clean, aerated seedbed for ${cleanName} with balanced drainage channels.`,
        whatToMonitor: ['Soil friability and clod breakdown', 'Peripheral drainage ditch clearance', 'Soil moisture status before sowing'],
        careRequirements: ['Apply well-rotted organic manure and basal phosphorus/potassium', 'Form ridges or raised beds if drainage is slow', 'Ensure field is level to prevent localized pooling'],
        commonProblems: ['Waterlogging in low spots', 'Compacted hardpan restricting root descent'],
        isMoistureCritical: false,
        moistureSensitivityNote: 'Pre-irrigate if soil is bone dry.',
      },
      {
        stageName: 'Seed Selection',
        stageNumber: 2,
        dayRange: 'Days -4 to -1',
        dayStart: -4,
        dayEnd: -1,
        whatHappens: `High-viability, disease-free certified seeds or planting material of ${cleanName} are inspected and pre-treated.`,
        whatToMonitor: ['Germination percentage rating (>80%)', 'Purity and absence of insect damage', 'Seed treatment verification'],
        careRequirements: ['Treat with bio-fungicides (Trichoderma) or approved seed dressings', 'Discard deformed, shriveled, or diseased seeds'],
        commonProblems: ['Seed-borne pathogens and damping off', 'Poor germination from expired seed stock'],
        isMoistureCritical: false,
        moistureSensitivityNote: 'Keep seeds in cool dry storage.',
      },
      {
        stageName: 'Seed Sowing / Planting',
        stageNumber: 3,
        dayRange: 'Days 0 to 4',
        dayStart: 0,
        dayEnd: 4,
        whatHappens: `Seeds or seedlings of ${cleanName} are planted at recommended depth and spacing into moist, firm soil.`,
        whatToMonitor: ['Sowing depth and seed-to-soil contact', 'Row and plant spacing uniformity', 'Soil moisture at seed placement level'],
        careRequirements: ['Ensure uniform placement depth', 'Provide gentle initial moisture to activate germination without dislodging seeds', 'Protect from foraging birds and rodents'],
        commonProblems: ['Deep planting causing delayed emergence', 'Soil crusting blocking emerging shoots'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'Keep topsoil moist to facilitate germination.',
      },
      {
        stageName: 'Germination',
        stageNumber: 4,
        dayRange: 'Days 5 to 10',
        dayStart: 5,
        dayEnd: 10,
        whatHappens: `Seeds imbibe water, radicle and plumule emerge through the soil surface into sunlight.`,
        whatToMonitor: ['Emergence percentage across the plot', 'Absence of crusting over emerging seedlings', 'Early damping-off symptoms'],
        careRequirements: ['Break surface crust gently if light rains compacted the surface', 'Guard against cutworms and crickets', 'Maintain light surface moisture'],
        commonProblems: ['Damping-off fungal infection in cold, saturated soil', 'Bird and rodent damage to tender emerging shoots'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'Maintain light, frequent moisture; avoid waterlogging.',
      },
      {
        stageName: 'Early Growth',
        stageNumber: 5,
        dayRange: 'Days 11 to 24',
        dayStart: 11,
        dayEnd: 24,
        whatHappens: `Seedlings establish primary root networks and unfold first set of true photosynthetic leaves.`,
        whatToMonitor: ['True leaf color and vigor', 'Early weed emergence competing for light and nutrients', 'Early sucking pest populations'],
        careRequirements: ['Perform first weeding and shallow intercultural hoeing', 'Thin excess seedlings to maintain single vigorous plant per station', 'Apply light early nitrogen top-dressing'],
        commonProblems: ['Weed smothering slow-growing young plants', 'Early sucking pests (aphids, thrips, flea beetles)'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'Roots are shallow; prevent upper root zone from drying out.',
      },
      {
        stageName: 'Vegetative Stage',
        stageNumber: 6,
        dayRange: 'Days 25 to 50',
        dayStart: 25,
        dayEnd: 50,
        whatHappens: `Intense canopy development, stem elongation, branching, and deep root expansion.`,
        whatToMonitor: ['Canopy expansion rate and green vigor', 'Foliar leaf spots and pest scouting on undersides of leaves', 'Soil moisture depth'],
        careRequirements: ['Apply secondary split of Nitrogen and Potassium', 'Earthing up around stems to support root stability and improve furrow drainage', 'Scout for chewing caterpillars and leaf miners'],
        commonProblems: ['Foliar fungal and bacterial leaf blights', 'Nutrient deficiencies causing chlorosis on older or younger leaves'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'Maintain regular irrigation schedule calibrated to evapotranspiration.',
      },
      {
        stageName: 'Flowering Stage',
        stageNumber: 7,
        dayRange: 'Days 51 to 70',
        dayStart: 51,
        dayEnd: 70,
        whatHappens: `Floral bud emergence, blooming, and pollination / fertilization.`,
        whatToMonitor: ['Flower retention vs flower drop', 'Activity of pollinating insects', 'Pests attacking flower clusters and flower buds'],
        careRequirements: ['CRITICAL: Maintain steady soil moisture; avoid water stress that triggers blossom abortion', 'Avoid chemical sprays during peak morning pollination hours', 'Apply foliar micronutrients (Boron, Zinc) if flower drop is observed'],
        commonProblems: ['Blossom abortion due to heat or moisture stress', 'Thrips and caterpillars destroying reproductive floral parts'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'HIGH SENSITIVITY: Moisture deficit at flowering reduces final fruit and grain set.',
      },
      {
        stageName: 'Fruit / Vegetable Development',
        stageNumber: 8,
        dayRange: 'Days 71 to 90',
        dayStart: 71,
        dayEnd: 90,
        whatHappens: `Fruit / seed expansion, carbohydrate filling, and accumulation of dry matter and nutrients.`,
        whatToMonitor: ['Fruit/grain enlargement uniformity', 'Skin disorders, blemishes, and fruit borers', 'Nutrient demand and potassium levels'],
        careRequirements: ['Maintain consistent soil moisture to prevent fruit cracking and ensure steady filling', 'Protect developing crop from fruit borers and fungal fruit rots', 'Support or stake heavy branches if required'],
        commonProblems: ['Fruit cracking caused by sudden dry-to-wet moisture swings', 'Fruit borer caterpillars and fungal fruit rot'],
        isMoistureCritical: true,
        moistureSensitivityNote: 'Consistent moisture required; avoid letting soil dry out completely and then flooding.',
      },
      {
        stageName: 'Maturity',
        stageNumber: 9,
        dayRange: 'Days 91 to 100',
        dayStart: 91,
        dayEnd: 100,
        whatHappens: `Physiological maturity reached; color changes, sugars/solids peak, and external tissue hardens.`,
        whatToMonitor: ['Maturity indices (color, firmness, moisture, aroma)', 'Weather forecasts for rain or heat spikes', 'Pre-harvest interval compliance for chemical sprays'],
        careRequirements: ['Reduce or cease irrigation to promote firm flesh and higher sugar/starch content', 'Observe chemical withdrawal periods strictly', 'Prepare harvesting tools, crates, and storage facilities'],
        commonProblems: ['Over-ripening or rotting on the plant if harvest is delayed', 'Bird and rodent predation on mature crop'],
        isMoistureCritical: false,
        moistureSensitivityNote: 'Reduce or cease irrigation to prevent rotting and enhance shelf life.',
      },
      {
        stageName: 'Harvest',
        stageNumber: 10,
        dayRange: 'Days 101 to 110',
        dayStart: 101,
        dayEnd: 110,
        whatHappens: `Harvesting at optimal commercial maturity followed by grading, sorting, cleaning, and storage.`,
        whatToMonitor: ['Gentle harvesting to avoid bruising and mechanical skin cuts', 'Harvesting temperature (harvest during cool morning hours)', 'Sorting out damaged or infected produce'],
        careRequirements: ['Harvest with sanitized, sharp shears or sickles', 'Keep harvested produce in cool shaded areas immediately', 'Pack into clean, well-aerated crates or bags'],
        commonProblems: ['Post-harvest rots and bruising during transit', 'Rapid moisture loss if left exposed in direct sun'],
        isMoistureCritical: false,
        moistureSensitivityNote: 'Field and produce must be dry during harvest.',
      },
    ],
  };
}
