import {
  FarmInputs,
  WeatherData,
  AdvisoryResponse,
  SupportedLanguage,
  SoilType,
  Season,
  GrowthStage,
  RecommendedCrop,
  WeatherAlert,
} from '../types';

interface CropSpecificExpertKnowledge {
  cropName: string;
  category: string;
  totalWaterRequirementMm: string;
  stages: Record<
    GrowthStage,
    {
      summary: string;
      actionItems: (soil: SoilType, rainUpcoming: boolean, temp: number) => string[];
      pestsAndDiseases: (humidity: number, temp: number) => string[];
      fertilizerAndSpray: (rainUpcoming: boolean, windSpeed: number) => string;
      waterRequirementNote: string;
    }
  >;
}

export const AGRONOMIC_KNOWLEDGE_BASE: Record<string, CropSpecificExpertKnowledge> = {
  paddy: {
    cropName: 'Paddy (Rice)',
    category: 'Cereal / Grain',
    totalWaterRequirementMm: '1200 - 1400 mm total life-cycle requirement',
    stages: {
      'Land Preparation / Sowing': {
        summary: 'Puddle the soil repeatedly to establish an impermeable hardpan that curtails percolation losses. Level field laser-flat.',
        actionItems: (soil, rain, temp) => [
          `Incorporate 10-12 tonnes/ha well-decomposed FYM or green manure 14 days before puddling in ${soil} soil.`,
          rain ? 'Channel expected rainfall directly into paddies to save tractor pumping costs.' : 'Maintain 2-3 cm water layer to facilitate puddle slurrying.',
          'Reinforce peripheral bunds to 30 cm height to prevent water leakage and runoff loss.',
          'Treat nursery seeds with Trichoderma (5g/kg) and soak 24h before incubation.',
        ],
        pestsAndDiseases: (h, t) => ['Root rot and damping-off in flooded nurseries', 'Bacterial leaf blight in warm stagnant water'],
        fertilizerAndSpray: (rain, wind) => 'Apply basal dose of 50% Phosphorus, 50% Potash, and 25 kg/ha Zinc Sulfate during final puddling.',
        waterRequirementNote: 'Requires saturated puddle conditions; maintain 2-3 cm shallow water.',
      },
      'Germination / Seedling': {
        summary: 'Nursery seedlings or direct-seeded sprouts anchor into the anaerobic mud layer. Developing adventitious roots require shallow water.',
        actionItems: (soil, rain, temp) => [
          'Maintain a shallow 1-2 cm water film; deep submergence starves emerging seedlings of oxygen.',
          'Monitor nursery beds for Khaira disease (rusty brown spots from Zinc deficiency).',
          'Gap-fill missing hills within 7 days of transplanting to maintain 33-40 hills per square meter.',
          soil.includes('Sandy') ? 'In sandy soils, ensure puddling has sealed the bed to avoid dry topsoil sinking.' : 'Drain excess water after sudden heavy downpours to keep leaf tips exposed.',
        ],
        pestsAndDiseases: (h, t) => ['Thrips curling tender leaf tips', 'Khaira disease (Zinc deficiency) in high pH soils', 'Damping-off fungal rot'],
        fertilizerAndSpray: (rain, wind) => 'Foliar spray of 0.5% Zinc Sulfate + 0.25% Lime if leaf rusty spotting appears.',
        waterRequirementNote: 'Maintain 1-2 cm shallow protective water layer.',
      },
      'Vegetative Growth': {
        summary: 'Active and maximum tillering phase. Culms multiply and leaf area expands. Alternate Wetting and Drying (AWD) is recommended to oxygenate roots.',
        actionItems: (soil, rain, temp) => [
          'Practice Alternate Wetting and Drying (AWD): allow standing water to recede to soil surface for 24-48 hours before re-flooding to stimulate deeper roots.',
          'Apply first top-dressing of Nitrogen (urea) at active tillering (25-30 days after transplanting).',
          'Rogue out off-types and deep-water grassy weeds (Echinochloa) before canopy closes.',
          rain ? 'Do not top-dress urea right before heavy rains to avoid nitrogen leaching into drainage ditches.' : 'Top-dress urea when leaves are dry in late morning.',
        ],
        pestsAndDiseases: (h, t) => [
          'Yellow Stem Borer (Scirpophaga incertulas) causing dead hearts in tillers',
          'Leaf Folder (Cnaphalocrocis medinalis) webbing leaves longitudinally',
          h > 75 ? 'Sheath blight starting at waterline under high humidity' : 'Green leafhopper transmitting tungro virus',
        ],
        fertilizerAndSpray: (rain, wind) => wind > 15 ? 'Hold foliar sprays until wind speed falls below 12 km/h to prevent spray drift.' : 'Top dress 1/3rd nitrogen split. Apply Cartap hydrochloride or Chlorantraniliprole if stem borer dead hearts exceed 5%.',
        waterRequirementNote: 'Maintain 3-5 cm water depth during tillering; practice intermittent AWD drying.',
      },
      'Flowering & Pollination': {
        summary: 'Panicle emergence (heading) and anthesis. This is the single most moisture-critical milestone in rice cultivation.',
        actionItems: (soil, rain, temp) => [
          'CRITICAL: Maintain continuous 4-5 cm standing water layer; zero moisture stress can be tolerated.',
          'Avoid applying any chemical pesticide sprays during morning pollination hours (8:00 AM - 11:30 AM).',
          'Scout for neck blast (black lesions at the panicle base) and Gundhi bug feeding on milky grains.',
          temp > 34 ? 'Keep water moving through field to reduce canopy temperature and prevent floret sterility.' : 'Maintain uniform water depth across the basin.',
        ],
        pestsAndDiseases: (h, t) => [
          'Neck blast (Pyricularia oryzae) severing nutrient flow to panicles',
          'Rice Gundhi bug (Leptocorisa acuta) piercing milk-stage spikelets',
          'Sheath rot and false smut in cloudy humid weather',
        ],
        fertilizerAndSpray: (rain, wind) => 'Spray Tricyclazole 75 WP (0.6g/L) if neck blast symptoms appear on boot leaf collar. Spray during calm late afternoon.',
        waterRequirementNote: 'HIGHEST MOISTURE SENSITIVITY: Maintain continuous 5 cm standing water.',
      },
      'Fruiting / Grain Formation': {
        summary: 'Milky, soft dough, and hard dough grain filling. Endosperm accumulates starch rapidly, and panicles bend downward.',
        actionItems: (soil, rain, temp) => [
          'Transition from 2-3 cm shallow water in milk stage to moist saturated soil in dough stage.',
          'Scout the base of dense hills for Brown Planthopper (BPH) hopper burn (sudden circular drying).',
          'Install rodent bait stations or physical traps along bunds to protect heavy grain-bearing tillers.',
          rain ? 'Clear drainage outlets so excess rainwater drains freely and does not submerge drooping panicles.' : 'Maintain soil saturation until hard dough stage.',
        ],
        pestsAndDiseases: (h, t) => [
          'Brown Planthopper (Nilaparvata lugens) at hill base causing circular hopper burn',
          'False smut (Ustilaginoidea virens) forming green/orange spore balls in spikelets',
        ],
        fertilizerAndSpray: (rain, wind) => 'Spray Pymetrozine 50 WDG (0.6g/L) directed at the base of hills if BPH exceeds 15-20 insects per hill. Avoid wetting foliage unnecessarily.',
        waterRequirementNote: 'Keep soil saturated through milk stage; withdraw standing water as grains enter hard dough.',
      },
      'Maturity / Harvesting': {
        summary: 'Physiological maturity. Panicles turn golden straw yellow, moisture drops below 20%, and grain dough hardens flinty.',
        actionItems: (soil, rain, temp) => [
          'DRAIN FIELD COMPLETELY 10 to 14 days before harvest to allow soil to dry and consolidate.',
          'Check grain hardness: 85% panicles golden yellow, grains cannot be dented with fingernail.',
          'Harvest promptly once moisture reaches 20-22% to avoid field lodging, grain shattering, and sun-checking cracks.',
          'Dry threshed paddy on clean tarpaulins until moisture reaches 12-14% for safe storage.',
        ],
        pestsAndDiseases: (h, t) => ['Field rodents and bird flocks', 'Aspergillus mold if harvested wet'],
        fertilizerAndSpray: (rain, wind) => 'Zero agrochemicals. Adhere to strict pre-harvest interval.',
        waterRequirementNote: 'ZERO IRRIGATION. Completely drain field 10-14 days prior to harvest.',
      },
    },
  },
  wheat: {
    cropName: 'Wheat',
    category: 'Cereal / Grain',
    totalWaterRequirementMm: '400 - 500 mm across 4-6 critical irrigation rounds',
    stages: {
      'Land Preparation / Sowing': {
        summary: 'Fine, firm, well-aerated seedbed with adequate subsoil moisture (Paleo irrigation) prepared to ensure rapid, uniform coleoptile emergence.',
        actionItems: (soil, rain, temp) => [
          'Apply pre-sowing irrigation (Paleo) if soil moisture is depleted to ensure uniform emergence.',
          'Incorporate basal dose of full Phosphorus, full Potash, and 1/3rd Nitrogen.',
          `Drill seeds at 4-5 cm depth into moist zone with 20-22.5 cm row spacing in ${soil} soil.`,
          'Plank after sowing to conserve seedbed moisture.',
        ],
        pestsAndDiseases: (h, t) => ['Loose smut (Ustilago tritici) seed-borne mycelium', 'Termites attacking seed in sandy dry soil'],
        fertilizerAndSpray: (rain, wind) => 'Treat seeds with Carboxin or Thiram (2.5g/kg) and Imidacloprid (3g/kg) against loose smut and termites.',
        waterRequirementNote: 'Pre-sowing Paleo irrigation (60-70 mm) is essential if soil is dry.',
      },
      'Germination / Seedling': {
        summary: 'Coleoptiles emerge through soil surface within 5-7 days under 18-22°C soil temperature. Crown Root Initiation (CRI) approaches at 20-25 days.',
        actionItems: (soil, rain, temp) => [
          'CRITICAL MILESTONE: First irrigation MUST be given at Crown Root Initiation (CRI) stage (Day 20-25).',
          'Scout for broadleaf weeds and Phalaris minor (canary grass) in early growth.',
          'Top dress 1/3rd Nitrogen (urea) right after or during the CRI irrigation.',
          rain ? 'If significant rain falls on Day 20-25, adjust irrigation volume to avoid waterlogging.' : 'Apply light 5 cm irrigation at CRI.',
        ],
        pestsAndDiseases: (h, t) => ['Phalaris minor weed competition', 'Damping-off in cold low spots'],
        fertilizerAndSpray: (rain, wind) => 'Apply Clodinafop-propargyl or Sulfosulfuron at 30-35 DAS on moist soil if grassy weeds appear.',
        waterRequirementNote: 'CRITICAL IRRIGATION #1: Crown Root Initiation (Day 20-25). Never skip.',
      },
      'Vegetative Growth': {
        summary: 'Tillering and jointing stage. Secondary tillers emerge from crown nodes, followed by stem elongation with nodes expanding.',
        actionItems: (soil, rain, temp) => [
          'Second irrigation at late tillering / jointing stage (40-45 DAS).',
          'Apply remaining nitrogen top-dressing split prior to stem jointing.',
          'Scout lower leaves for yellow rust linear yellow pustules during cool, cloudy, humid mornings.',
          soil.includes('Sandy') ? 'In sandy soils, split nitrogen into smaller, more frequent doses.' : 'Ensure no water stagnation for >12 hours in clay soils.',
        ],
        pestsAndDiseases: (h, t) => [
          h > 70 ? 'Yellow rust (Puccinia striiformis) forming stripes of yellow powder on leaves' : 'Armyworms in dense canopy',
          'Aphids on lower leaves',
        ],
        fertilizerAndSpray: (rain, wind) => 'Spray Propiconazole 25 EC (1ml/L) immediately if yellow rust pustules are scouted.',
        waterRequirementNote: 'CRITICAL IRRIGATION #2: Late tillering / jointing stage (40-45 DAS).',
      },
      'Flowering & Pollination': {
        summary: 'Booting, ear head emergence (heading), and flowering. Florets self-pollinate within spikelets.',
        actionItems: (soil, rain, temp) => [
          'CRITICAL: Third irrigation at flowering/heading stage (60-65 DAS).',
          'DO NOT irrigate on windy days (>15 km/h) to prevent crop lodging (falling flat).',
          'Scout for ear head aphids and loose smut black powder replacing grains.',
          temp > 28 ? 'Maintain soil moisture to buffer against early terminal heat stress.' : 'Maintain uniform moisture.',
        ],
        pestsAndDiseases: (h, t) => ['Wheat aphids clustering on green ear heads', 'Head blight and powdery mildew in foggy weather'],
        fertilizerAndSpray: (rain, wind) => 'Spray Neem oil or Imidacloprid (0.3ml/L) if aphid colonies exceed 10-15 per ear head.',
        waterRequirementNote: 'CRITICAL IRRIGATION #3: Flowering / heading stage (60-65 DAS). Avoid irrigating in high winds.',
      },
      'Fruiting / Grain Formation': {
        summary: 'Milking and dough grain filling. Starch accumulates rapidly. Terminal heat can shrivel grains if moisture is lacking.',
        actionItems: (soil, rain, temp) => [
          'Fourth irrigation at milking stage (80-85 DAS) and fifth at soft dough stage (95-100 DAS).',
          'Apply light, calm-weather irrigation only; never saturate in high winds.',
          'Spray 1% Potassium Nitrate (13:0:45) foliar spray to shield flag leaves against terminal heat.',
          rain ? 'Rely on incoming rainfall to satisfy milking stage water demand.' : 'Maintain steady moisture through milk stage.',
        ],
        pestsAndDiseases: (h, t) => ['Grain aphids sucking sap from soft developing kernels', 'Terminal heat stress shriveling grains'],
        fertilizerAndSpray: (rain, wind) => 'Foliar spray of 1% Potassium Nitrate or 0.2% Boron to enhance grain weight.',
        waterRequirementNote: 'CRITICAL IRRIGATIONS #4 & #5: Milking and soft dough stages.',
      },
      'Maturity / Harvesting': {
        summary: 'Physiological maturity. Golden straw color throughout. Grains turn hard flinty, moisture drops below 14%.',
        actionItems: (soil, rain, temp) => [
          'CEASE ALL IRRIGATION COMPLETELY once grain enters hard dough stage.',
          'Allow soil to dry to support combine harvester weight without soil compaction.',
          'Harvest when grain moisture drops to 12-14% during warm dry afternoon hours.',
          'Store grain in dry, fumigated bins on wooden pallets with neem leaves.',
        ],
        pestsAndDiseases: (h, t) => ['Granary weevils (Sitophilus oryzae) in storage', 'Pre-harvest sprouting if late rain hits'],
        fertilizerAndSpray: (rain, wind) => 'Zero chemical application. Adhere to pre-harvest withdrawal.',
        waterRequirementNote: 'ZERO IRRIGATION. Field must be completely dry for combine harvesting.',
      },
    },
  },
  tomato: {
    cropName: 'Tomato',
    category: 'Vegetable',
    totalWaterRequirementMm: '600 - 750 mm across regular frequent irrigation cycles',
    stages: {
      'Land Preparation / Sowing': {
        summary: 'Raised beds or ridges prepared with organic manure and calcium amendments to ensure excellent drainage and prevent blossom end rot.',
        actionItems: (soil, rain, temp) => [
          'Incorporate 20-25 tonnes/ha decomposed FYM and 50 kg single superphosphate.',
          'Form raised beds (15-20 cm high) to avoid water stagnating around the tender stem collar.',
          'Apply agricultural lime or gypsum if soil is calcium-deficient to prevent blossom-end rot later.',
          `In ${soil} soil, ensure drainage ditches are clear to drain rainwater within 30 minutes.`,
        ],
        pestsAndDiseases: (h, t) => ['Root-knot nematodes in light soils', 'Damping-off in poorly drained flat beds'],
        fertilizerAndSpray: (rain, wind) => 'Basal application of NPK (40:80:60 kg/ha) + 25 kg Calcium Nitrate.',
        waterRequirementNote: 'Moisten raised beds before transplanting.',
      },
      'Germination / Seedling': {
        summary: 'Transplanted seedlings establish new root hairs and resume active vegetative turgidity.',
        actionItems: (soil, rain, temp) => [
          'Transplant 25-30 day old sturdy seedlings in late afternoon at 60 cm x 45 cm spacing.',
          'Drench root zone immediately with water containing Carbendazim (1g/L) or Trichoderma.',
          'Install yellow sticky traps (15-20/acre) to scout for whiteflies carrying Tomato Leaf Curl Virus.',
          rain ? 'Avoid waterlogging around root plug; raised beds shed excess water safely.' : 'Give immediate life-saving drip/furrow irrigation.',
        ],
        pestsAndDiseases: (h, t) => ['Whitefly (Bemisia tabaci) transmitting ToLCV', 'Cutworms severing young stems at night'],
        fertilizerAndSpray: (rain, wind) => 'Spray Neem oil (10,000 ppm @ 2ml/L) or botanical extract against early sucking pests.',
        waterRequirementNote: 'Light daily moisture to establish root plugs without waterlogging.',
      },
      'Vegetative Growth': {
        summary: 'Branching and canopy development. Staking indeterminate varieties keeps foliage off damp soil.',
        actionItems: (soil, rain, temp) => [
          'Stake plants with bamboo poles and twine to prevent foliage from touching wet soil.',
          'Apply first top dressing of Nitrogen and Potassium (or weekly fertigation via drip).',
          'Prune side suckers below the first flower cluster on staked indeterminate vines.',
          'Scout lower leaves for concentric rings of early blight (Alternaria solani).',
        ],
        pestsAndDiseases: (h, t) => [
          'Early blight (Alternaria solani) starting on lower older leaves',
          'Serpentine leaf miner tunneling between leaf surfaces',
        ],
        fertilizerAndSpray: (rain, wind) => 'Spray Mancozeb (2g/L) or Copper oxychloride as prophylactic against early blight before humid spells.',
        waterRequirementNote: 'Steady, regular watering every 4-6 days in loamy soil; avoid dry-to-wet swings.',
      },
      'Flowering & Pollination': {
        summary: 'Profuse blooming and fruit set. Extreme sensitivity to moisture fluctuation and heat spikes.',
        actionItems: (soil, rain, temp) => [
          'CRITICAL: Maintain steady soil moisture; NEVER allow soil to dry out and then flood (triggers massive blossom drop).',
          'Avoid overhead sprinkler irrigation which knocks off pollen and spreads fungal spores.',
          'Foliar spray of Boron (1g/L) + Calcium Nitrate (2g/L) to boost flower retention and prevent blossom-end rot.',
          temp > 32 ? 'Run drip cycles early in the morning to keep root zone cool and humid.' : 'Maintain regular moisture.',
        ],
        pestsAndDiseases: (h, t) => [
          'Blossom drop due to heat (>34°C) or erratic moisture',
          'Thrips feeding inside flowers causing distorted ovaries',
        ],
        fertilizerAndSpray: (rain, wind) => 'Foliar spray of Planofix (NAA @ 0.25ml/L) or micronutrient boron spray during calm evening.',
        waterRequirementNote: 'HIGHEST MOISTURE SENSITIVITY: Steady uniform watering. Never let soil dry out.',
      },
      'Fruiting / Grain Formation': {
        summary: 'Fruit enlargement and sizing. Erratic watering causes skin cracking and blossom-end rot.',
        actionItems: (soil, rain, temp) => [
          'Maintain very consistent, steady drip irrigation cycles to prevent skin cracking.',
          'Apply Potassium-rich fertigation (0:0:50) to enhance fruit wall firmness, brix, and color.',
          'Install pheromone traps for fruit borer (Helicoverpa armigera); spray Bt or Spinosad if larvae appear.',
          rain ? 'Harvest mature fruits before heavy storms to prevent skin cracking and rain splitting.' : 'Maintain uniform furrow moisture.',
        ],
        pestsAndDiseases: (h, t) => [
          'Tomato fruit borer (Helicoverpa armigera) boring into green fruits',
          'Blossom-End Rot (black sunken leathery bottom from calcium deficiency + moisture swings)',
          h > 75 ? 'Late blight (Phytophthora infestans) rotting fruits overnight in cold fog' : 'Fruit cracking',
        ],
        fertilizerAndSpray: (rain, wind) => 'Spray Spinosad 45 SC (0.3ml/L) or Emamectin benzoate (0.5g/L) for fruit borer. Spray Cymoxanil + Mancozeb if late blight threatens.',
        waterRequirementNote: 'CRITICAL UNIFORMITY: Fluctuating moisture is the #1 cause of fruit cracking and blossom-end rot.',
      },
      'Maturity / Harvesting': {
        summary: 'Breaker to red-ripe maturity. Harvest in plastic crates with soft liners.',
        actionItems: (soil, rain, temp) => [
          'Slightly taper off irrigation volume to enhance sugar concentration and shelf life.',
          'Pick fruits at breaker stage (10% color change) for distant transport, or red-ripe for local sale.',
          'Harvest every 3-4 days in the morning after dew evaporates; avoid packing wet fruit.',
          'Store harvested tomatoes at 12-15°C; never store in domestic refrigerators below 10°C.',
        ],
        pestsAndDiseases: (h, t) => ['Post-harvest soft rot (Rhizopus) in bruised fruit', 'Late blight rot'],
        fertilizerAndSpray: (rain, wind) => 'Zero agrochemical spraying within 5 days of harvest (respect pre-harvest interval).',
        waterRequirementNote: 'Taper off irrigation to improve solids and shelf life.',
      },
    },
  },
};

// Heuristic agronomic profile generator for any other crop
export function getCropExpertKnowledge(cropName: string, growthStage: GrowthStage): {
  cropName: string;
  category: string;
  totalWaterRequirementMm: string;
  summary: string;
  actionItems: (soil: SoilType, rainUpcoming: boolean, temp: number) => string[];
  pestsAndDiseases: (humidity: number, temp: number) => string[];
  fertilizerAndSpray: (rainUpcoming: boolean, windSpeed: number) => string;
  waterRequirementNote: string;
} {
  const q = (cropName || 'crop').toLowerCase().trim();
  let matchedKey = Object.keys(AGRONOMIC_KNOWLEDGE_BASE).find(
    (k) => q.includes(k) || k.includes(q.split(' ')[0])
  );

  if (matchedKey && AGRONOMIC_KNOWLEDGE_BASE[matchedKey]) {
    const data = AGRONOMIC_KNOWLEDGE_BASE[matchedKey];
    const stageData = data.stages[growthStage] || data.stages['Vegetative Growth'];
    return {
      cropName: data.cropName,
      category: data.category,
      totalWaterRequirementMm: data.totalWaterRequirementMm,
      summary: stageData.summary,
      actionItems: stageData.actionItems,
      pestsAndDiseases: stageData.pestsAndDiseases,
      fertilizerAndSpray: stageData.fertilizerAndSpray,
      waterRequirementNote: stageData.waterRequirementNote,
    };
  }

  // Generic dynamic crop agronomic profile
  const cleanName = cropName || 'General Crop';
  return {
    cropName: cleanName,
    category: 'Field / Horticulture Crop',
    totalWaterRequirementMm: '450 - 650 mm benchmark water requirement',
    summary: `${cleanName} is in the active ${growthStage} phase. Agronomic priorities center on root aeration, balanced nutrient uptake, and stage-specific moisture management.`,
    actionItems: (soil, rain, temp) => [
      `Check soil moisture at 10-15 cm active root depth in ${soil} soil before running irrigation pumps.`,
      rain ? 'Postpone irrigation rounds; allow forecast rainfall to replenish the root zone naturally.' : 'Maintain regular irrigation cycles in early morning or late afternoon.',
      'Scout the canopy undersides for early sucking pests and foliar leaf spot lesions.',
      `Ensure field drainage channels in ${soil} soil are clear to avoid localized water stagnation.`,
    ],
    pestsAndDiseases: (h, t) => [
      h > 70 ? 'Foliar fungal leaf spots and blights during humid spells' : 'Sucking insects (aphids, thrips, whiteflies)',
      'Root-zone fungal rot if water pools around stem collars',
    ],
    fertilizerAndSpray: (rain, wind) => wind > 15 ? 'Hold foliar spray rounds until wind speeds drop below 12 km/h to prevent drift.' : 'Apply balanced NPK nutrients based on current stage demand; avoid spraying in midday heat.',
    waterRequirementNote: 'Maintain steady root-zone moisture without creating surface water pools.',
  };
}

// Generate smart crop recommendations tailored to season & soil, never recommending the existing crop
export function generateSmartCropRecommendations(
  existingCrop: string,
  season: Season,
  soilType: SoilType
): RecommendedCrop[] {
  const current = (existingCrop || '').toLowerCase();

  interface Candidate {
    name: string;
    variety: string;
    seasons: string[];
    soils: SoilType[];
    why: string;
    weather: string;
    limitations: string;
    waterLevel: 'Low' | 'Moderate' | 'High';
    duration: string;
    growthPotential: string;
  }

  const catalog: Candidate[] = [
    {
      name: 'Chickpea (Gram)',
      variety: 'Pusa 372 / JG 11 (Desi) or KAK 2 (Kabuli)',
      seasons: ['Rabi (Winter)', 'Winter', 'Autumn'],
      soils: ['Clay', 'Clay Loam', 'Loamy', 'Sandy Loam'],
      why: 'Deep-rooting legume that fixes 30-40 kg atmospheric nitrogen per hectare and breaks cereal disease cycles.',
      weather: 'Cool dry climate (15-25°C), low humidity, bright sunshine.',
      limitations: 'Highly sensitive to water stagnation and cloudy humid weather at flowering.',
      waterLevel: 'Low',
      duration: '105 - 115 days',
      growthPotential: 'High profit margin with minimal irrigation and nitrogen fertilizer requirements.',
    },
    {
      name: 'Mustard / Rapeseed',
      variety: 'Pusa Bold / NRCHB-101 / RH-749',
      seasons: ['Rabi (Winter)', 'Winter'],
      soils: ['Sandy Loam', 'Loamy', 'Clay Loam'],
      why: 'High-value oilseed with low water requirement, thrives on residual soil moisture after monsoon crops.',
      weather: 'Cool winter weather (15-24°C) with dry bright sunny days during grain filling.',
      limitations: 'Vulnerable to mustard aphid epidemics during persistent cloudy or humid weather.',
      waterLevel: 'Low',
      duration: '110 - 120 days',
      growthPotential: 'Excellent oil content (38-42%) and strong domestic market demand.',
    },
    {
      name: 'Wheat',
      variety: 'HD-2967 / PBW-550 / GW-322',
      seasons: ['Rabi (Winter)', 'Winter'],
      soils: ['Loamy', 'Clay Loam', 'Sandy Loam'],
      why: 'Reliable staple cereal for winter season with assured market procurement and high yield stability.',
      weather: 'Cool vegetative period (15-20°C) with dry sunny grain ripening.',
      limitations: 'Requires 4-5 timely irrigations, especially at the critical Crown Root Initiation (CRI) stage.',
      waterLevel: 'Moderate',
      duration: '115 - 125 days',
      growthPotential: 'High yields (4.5 - 5.5 t/ha) with mechanized harvesting compatibility.',
    },
    {
      name: 'Soybean',
      variety: 'JS 335 / JS 95-60 / NRC 37',
      seasons: ['Kharif (Monsoon)', 'Summer'],
      soils: ['Clay', 'Clay Loam', 'Loamy'],
      why: 'High-protein oilseed that thrives in black and clay soils, enriching soil fertility with rhizobium nodules.',
      weather: 'Warm humid monsoon (24-30°C) with well-distributed seasonal rainfall.',
      limitations: 'Cannot tolerate waterlogging for >24 hours; requires raised beds or BBF drainage.',
      waterLevel: 'Moderate',
      duration: '95 - 105 days',
      growthPotential: 'Rapid turnaround crop providing early cash flow before winter rabi sowing.',
    },
    {
      name: 'Maize (Hybrid Corn)',
      variety: 'Pioneer 3396 / DKC 9108 / Bio 9681',
      seasons: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Spring', 'Summer'],
      soils: ['Loamy', 'Clay Loam', 'Sandy Loam'],
      why: 'Versatile C4 photosynthetic cereal with exceptional yield potential for food, poultry feed, and industrial starch.',
      weather: 'Warm sunny weather (21-30°C), highly responsive to bright solar radiation.',
      limitations: 'Requires scout vigilance against Fall Armyworm (FAW) in early vegetative stages.',
      waterLevel: 'Moderate',
      duration: '100 - 115 days',
      growthPotential: 'Very high yield ceiling (6-8 t/ha) with strong industrial grain demand.',
    },
    {
      name: 'Green Gram (Moong)',
      variety: 'IPM 205-7 (Virat) / Pusa Vishal / Samrat',
      seasons: ['Zaid (Summer)', 'Summer', 'Spring', 'Kharif (Monsoon)'],
      soils: ['Loamy', 'Sandy Loam', 'Clay Loam'],
      why: 'Short-duration (60-65 days) catch crop that slots perfectly into crop rotations and enriches soil with nitrogen.',
      weather: 'Warm dry conditions (25-35°C), requires irrigation during hot summer months.',
      limitations: 'Susceptible to Yellow Mosaic Virus transmitted by whiteflies if unmonitored.',
      waterLevel: 'Low',
      duration: '60 - 65 days',
      growthPotential: 'Shortest duration pulse with premium market price and massive soil health benefits.',
    },
    {
      name: 'Tomato (F1 Hybrid)',
      variety: 'Abhinav / US-440 / Arka Rakshak',
      seasons: ['Rabi (Winter)', 'Kharif (Monsoon)', 'Spring'],
      soils: ['Sandy Loam', 'Loamy', 'Clay Loam'],
      why: 'High-value commercial vegetable delivering multiple harvests over a 45-day picking window.',
      weather: 'Mild warm temperatures (20-28°C), good sunshine, protected from frost.',
      limitations: 'Requires trellising/staking and preventive fungicide cover against blight.',
      waterLevel: 'Moderate',
      duration: '100 - 115 days',
      growthPotential: 'High gross revenue per acre under drip irrigation and plastic mulching.',
    },
    {
      name: 'Paddy (Rice)',
      variety: 'Basmati 1509 / PR 126 / Swarna',
      seasons: ['Kharif (Monsoon)', 'Summer'],
      soils: ['Clay', 'Clay Loam', 'Silt'],
      why: 'Heavy-bearing staple cereal specifically adapted to saturated clay basins with high water retention.',
      weather: 'Hot humid monsoonal conditions (25-34°C) with abundant rainfall.',
      limitations: 'Very high water requirement (1200-1400 mm total).',
      waterLevel: 'High',
      duration: '115 - 130 days',
      growthPotential: 'Assured procurement, staple consumption, and high export value for aromatic Basmati varieties.',
    },
  ];

  // Filter out the currently planted crop
  const filtered = catalog.filter((c) => {
    const cName = c.name.toLowerCase();
    return !current.includes(cName.split(' ')[0]) && !cName.includes(current.split(' ')[0]);
  });

  // Rank based on season match and soil match
  const scored = filtered.map((c) => {
    let score = 0;
    if (c.seasons.some((s) => season.toLowerCase().includes(s.toLowerCase().split(' ')[0]))) score += 3;
    if (c.soils.includes(soilType)) score += 2;
    return { candidate: c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item, idx) => ({
    cropName: item.candidate.name,
    varietyOrType: item.candidate.variety,
    whySuitable: item.candidate.why,
    suitableWeatherConditions: item.candidate.weather,
    importantLimitations: item.candidate.limitations,
    waterNeedLevel: item.candidate.waterLevel,
    estimatedDuration: item.candidate.duration,
    growthPotentialNote: item.candidate.growthPotential,
  }));
}

// Evaluates live conditions to produce dynamic, accurate agricultural advisory
export function generateComprehensiveAgronomicAdvisory(
  inputs: FarmInputs,
  weatherData: WeatherData,
  lang: SupportedLanguage = 'en'
): AdvisoryResponse {
  const crop = inputs.existingCrop || 'Paddy';
  const stage = inputs.cropGrowthStage || 'Vegetative Growth';
  const soil = inputs.soilType || 'Loamy';
  const temp = weatherData?.current?.temperature ?? 28;
  const humidity = weatherData?.current?.relativeHumidity ?? 60;
  const wind = weatherData?.current?.windSpeed ?? 10;
  const condition = weatherData?.current?.weatherCondition ?? 'Partly Cloudy';

  const upcomingRainSum = weatherData?.forecast
    ? weatherData.forecast.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0)
    : 0;
  const maxRainProb = weatherData?.forecast
    ? Math.max(...weatherData.forecast.slice(0, 3).map((d) => d.precipitationProbability || 0))
    : 0;

  const hasSubstantialRain = upcomingRainSum >= 5.0 || maxRainProb >= 50;
  const isHarvesting = stage.includes('Maturity') || stage.includes('Harvest');

  // Fetch specialized crop knowledge
  const cropKnowledge = getCropExpertKnowledge(crop, stage);

  // Irrigation Status Determination
  let status: 'IRRIGATE_NOW' | 'POSTPONE' | 'ADEQUATE_MOISTURE' | 'MONITOR_SOIL' = 'MONITOR_SOIL';
  let statusTitle = 'Monitor Root-Zone Soil Moisture Before Irrigating';
  let summary = '';
  let checkSchedule = 'Inspect soil moisture at 10-15 cm depth tomorrow between 7:00 AM and 9:00 AM using the hand-feel test.';
  let postponeReason: string | null = null;

  if (isHarvesting) {
    status = 'ADEQUATE_MOISTURE';
    statusTitle = `Withhold Irrigation: ${crop} in ${stage} Stage`;
    summary = `Your ${crop} crop is approaching maturity and harvest. Discontinue irrigation 10-15 days prior to harvest. This allows grains and produce to cure, prevents root or fruit fungal rotting, minimizes lodging, and hardens the soil for harvesting machinery.`;
    postponeReason = 'Irrigation ceases during maturity to facilitate natural drying, lodging resistance, and soil firming.';
  } else if (hasSubstantialRain) {
    status = 'POSTPONE';
    statusTitle = `Postpone Irrigation: ${upcomingRainSum.toFixed(1)} mm Rainfall Forecast Ahead`;
    postponeReason = `With approximately ${upcomingRainSum.toFixed(1)} mm of rain projected over the next 72 hours (${maxRainProb}% peak probability), natural rainfall is expected to replenish the root zone. Applying irrigation now would cause surface runoff, risk waterlogging in ${soil} soil, and leach soluble nitrogen fertilizers below the root zone.`;
    summary = postponeReason;
  } else if (temp >= 32 && !hasSubstantialRain && (stage.includes('Flowering') || stage.includes('Fruiting'))) {
    status = 'IRRIGATE_NOW';
    statusTitle = `Irrigation Recommended: High Transpiration Demand during ${stage}`;
    summary = `${crop} is at the moisture-critical ${stage} phase under elevated temperatures (${temp}°C). Apply scheduled irrigation in early morning or late afternoon to prevent flower abortion and maintain physiological turgidity.`;
  } else {
    status = 'MONITOR_SOIL';
    statusTitle = `Check Root-Zone Moisture: Moderate Conditions in ${soil} Soil`;
    summary = `Current weather conditions (${temp}°C, ${humidity}% RH) show moderate evaporative loss. Check soil moisture at effective root depth before switching on irrigation pumps to avoid excessive water use.`;
  }

  // Action steps
  const actionSteps = [
    status === 'POSTPONE'
      ? `Hold off irrigation rounds and ensure field drainage channels are clear of silt before incoming rains.`
      : status === 'IRRIGATE_NOW'
      ? `Schedule irrigation during cool hours (early morning 6-9 AM or late afternoon) to minimize evaporative loss.`
      : `Test topsoil moisture at 10-15 cm depth: if soil forms a ball that crumbles easily, delay watering for 48 hours.`,
    cropKnowledge.actionItems(soil, hasSubstantialRain, temp)[0] || 'Maintain uniform soil aeration.',
    wind > 16
      ? `Wind speed is elevated (${wind} km/h); postpone any foliar spraying until wind drops below 12 km/h to prevent spray drift.`
      : hasSubstantialRain
      ? `Postpone chemical and fertilizer applications until rain clears to avoid chemical washout.`
      : `Scout crop foliage for ${cropKnowledge.pestsAndDiseases(humidity, temp)[0] || 'pest infestation'} during morning walk.`,
  ];

  // Soil dynamics explanation
  const getSoilWaterRetentionNote = (soilType: SoilType): string => {
    switch (soilType) {
      case 'Sandy':
      case 'Sandy Loam':
        return `${soilType} soils feature rapid infiltration rates (25-50 mm/hr) and low water retention capacity. Moisture drains quickly below root depth, requiring lighter, more frequent irrigation rounds.`;
      case 'Clay':
      case 'Clay Loam':
        return `${soilType} soils possess high water-holding capacity but low permeability. They are prone to waterlogging and compaction if over-irrigated. Ensure surface drains are functional to prevent root hypoxia.`;
      case 'Loamy':
      case 'Silt':
        return `${soilType} soils provide an ideal balance of capillary water retention and macropore aeration. Allow the top 5 cm to dry slightly between irrigation events to stimulate deep root exploration.`;
      default:
        return `${soilType} soil requires balanced moisture management to prevent both dry-out and stagnant waterlogging.`;
    }
  };

  // Weather alerts
  const weatherAlerts: WeatherAlert[] = [];
  if (temp >= 35) {
    weatherAlerts.push({
      id: 'alert-heat',
      severity: 'warning',
      headline: `Elevated Heat Advisory (${temp}°C)`,
      description: `High daytime temperature accelerates crop evapotranspiration. Protect sensitive flowering stages with timely morning irrigation.`,
      source: 'Agri-Meteorological Analysis',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
  if (hasSubstantialRain) {
    weatherAlerts.push({
      id: 'alert-rain',
      severity: 'info',
      headline: `Incoming Precipitation Forecast (${upcomingRainSum.toFixed(1)} mm)`,
      description: `Natural rainfall expected across the next 72 hours with peak probability of ${maxRainProb}%. Postpone irrigation and fertilizer broadcasting.`,
      source: 'Agri-Meteorological Analysis',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
  if (wind >= 18) {
    weatherAlerts.push({
      id: 'alert-wind',
      severity: 'warning',
      headline: `High Wind Alert (${wind} km/h)`,
      description: `Brisk winds increase foliar desiccation and cause severe spray drift. Withhold foliar sprays and pesticide dusting until winds subside.`,
      source: 'Agri-Meteorological Analysis',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
  if (humidity >= 75 && temp >= 20) {
    weatherAlerts.push({
      id: 'alert-humidity',
      severity: 'info',
      headline: `High Atmospheric Humidity (${humidity}%)`,
      description: `Sustained high humidity creates ideal microclimate for foliar fungal and bacterial blights. Scout lower canopy for leaf spots.`,
      source: 'Agri-Meteorological Analysis',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  // AI explanation text
  const aiExplanation = `Field agronomy analysis for ${inputs.location || 'your farm'} (${soil} soil, ${inputs.season || 'current season'}): Current weather shows a temperature of ${temp}°C, ${condition}, relative humidity of ${humidity}%, and wind speed of ${wind} km/h. Over the upcoming 72 hours, cumulative precipitation is estimated at ${upcomingRainSum.toFixed(1)} mm (maximum rain probability: ${maxRainProb}%). For your standing ${crop} crop in the ${stage} stage, agricultural protocols recommend ${hasSubstantialRain ? 'suspending artificial irrigation and clearing drainage pathways' : isHarvesting ? 'withholding all irrigation to facilitate grain curing and lodging resistance' : 'monitoring root-zone moisture and maintaining light early-morning watering'}.`;

  return {
    engineUsed: 'Deep Agronomic Expert Knowledge Engine',
    aiExplanation: {
      overview: `Field agronomy analysis for ${inputs.location || 'your farm'} (${soil} soil, ${inputs.season || 'current season'}): Current weather shows a temperature of ${temp}°C, ${condition}, relative humidity of ${humidity}%, and wind speed of ${wind} km/h.`,
      climateAndSoilAnalysis: `Over the upcoming 72 hours, cumulative precipitation is estimated at ${upcomingRainSum.toFixed(1)} mm (maximum rain probability: ${maxRainProb}%). In ${soil} soil, ${getSoilWaterRetentionNote(soil)}`,
      keyTakeawayForFarmer: `For standing ${crop} in the ${stage} stage, protocols recommend ${hasSubstantialRain ? 'suspending artificial irrigation and clearing drainage pathways.' : isHarvesting ? 'withholding all irrigation to facilitate grain curing and prevent lodging.' : 'monitoring root-zone moisture and applying controlled irrigation.'}`,
    },
    standingCropAdvice: {
      cropName: crop,
      stage,
      stageSummary: cropKnowledge.summary,
      keyActionItems: cropKnowledge.actionItems(soil, hasSubstantialRain, temp),
      pestAndDiseaseVigilance: cropKnowledge.pestsAndDiseases(humidity, temp).join(' • '),
      fertilizerAndSprayAdvice: cropKnowledge.fertilizerAndSpray(hasSubstantialRain, wind),
    },
    recommendedCrops: generateSmartCropRecommendations(crop, inputs.season || 'Kharif (Monsoon)', soil),
    irrigationAdvisory: {
      status,
      statusTitle,
      summary,
      checkSchedule,
      postponeReason,
      recentRainfallImpact: weatherData?.current?.precipitation && weatherData.current.precipitation > 0
        ? `Recent rainfall of ${weatherData.current.precipitation} mm has dampened surface soil layers, reducing immediate root-zone water deficit.`
        : `No significant recent rainfall recorded; root zone is dependent on stored moisture and irrigation scheduling.`,
      forecastRainfallImpact: hasSubstantialRain
        ? `Expected ${upcomingRainSum.toFixed(1)} mm rainfall over the next 72 hours will replenish root moisture in ${soil} soil without requiring pumping.`
        : `Forecast rainfall is minimal (${upcomingRainSum.toFixed(1)} mm), meaning artificial irrigation must maintain necessary crop turgidity.`,
      approximateWaterRequirement: cropKnowledge.totalWaterRequirementMm,
      soilWaterRetentionNote: getSoilWaterRetentionNote(soil),
      actionSteps,
    },
    weatherAlerts,
    safetyDisclaimer: 'Agricultural advisories are grounded in recognized regional agronomic guidelines and live meteorological forecasts. Verify with your district agricultural extension officer before major capital or chemical commitments.',
  };
}
