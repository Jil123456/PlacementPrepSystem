export const calculateCompanyReadiness = (user) => {
  if (!user) return [];

  const companies = user.preferred_companies || [];
  const streak = user.streak || 0;
  
  // Calculate performance based on XP (grows as they solve tasks correctly)
  const xp = user.level?.current_xp || 0;
  const daysCompleted = Math.max(0, (user.current_day || 1) - 1);
  
  // Base progress: 1% per day completed + 1% per 50 XP
  // This ensures they start at 0% and it grows dynamically
  const progressScore = Math.min(60, (daysCompleted * 1.5) + (xp / 50));
  
  const bonus = streak > 7 ? 5 : (streak > 3 ? 2 : 0);

  const productCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe'];

  return companies.map(company => {
    // Product companies are harder, so their score scales slightly slower initially
    const isProduct = productCompanies.includes(company);
    const companyMultiplier = isProduct ? 0.85 : 1.0;
    
    let score = Math.round(progressScore * companyMultiplier) + bonus;
    
    // Cap at 100
    score = Math.min(Math.max(score, 0), 100);

    return {
      name: company,
      score,
      isProduct
    };
  }).sort((a, b) => b.score - a.score);
};
