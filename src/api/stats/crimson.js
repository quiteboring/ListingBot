import { titleCase } from '../../utils/format.js';

export const getCrimsonIsle = (profile) => {
  try {
    const crimsonIsle = profile.nether_island_player_data;

    return {
      faction: titleCase(crimsonIsle.selected_faction || 'none'),
      reputation: {
        barbarian: crimsonIsle.barbarians_reputation ?? 0,
        mage: crimsonIsle.mages_reputation ?? 0,
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getKuudra = (profile) => {
  try {
    const crimsonIsle = profile.nether_island_player_data || {};

    return {
      basic: crimsonIsle.kuudra_completed_tiers?.none ?? 0,
      hot: crimsonIsle.kuudra_completed_tiers?.hot ?? 0,
      burning: crimsonIsle.kuudra_completed_tiers?.burning ?? 0,
      fiery: crimsonIsle.kuudra_completed_tiers?.fiery ?? 0,
      infernal: crimsonIsle.kuudra_completed_tiers?.infernal ?? 0,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
