export const calculateCompanyReadiness = (user) => {
  if (!user) return [];

  const scores = user.initial_assessment_scores || { dsa: 50, core: 50, aptitude: 50, hr: 50 };
  const companies = user.preferred_companies || [];
  const streak = user.streak || 0;
  const bonus = streak > 7 ? 5 : 0;

  const productCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe'];
  const serviceCompanies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'];

  return companies.map(company => {
    let score = 0;
    const dsa = Number(scores.dsa) || 0;
    const core = Number(scores.core) || 0;
    const aptitude = Number(scores.aptitude) || 0;
    const hr = Number(scores.hr) || 0;

    if (productCompanies.includes(company)) {
      score = (dsa * 0.40) + (core * 0.25) + (aptitude * 0.20) + (hr * 0.15);
    } else {
      score = (dsa * 0.20) + (core * 0.25) + (aptitude * 0.40) + (hr * 0.15);
    }
    
    // Add consistency bonus and cap at 100
    score = Math.min(Math.round(score + bonus), 100);

    return {
      name: company,
      score,
      isProduct: productCompanies.includes(company)
    };
  }).sort((a, b) => b.score - a.score);
};
