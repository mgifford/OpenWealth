export function buildProfileSection(household) {
  return {
    section_id: "profile",
    title: "Household profile",
    household_id: household.household_id,
    name: household.name,
    province_or_territory: household.province_or_territory,
    people: household.people ?? []
  };
}
