module.exports = async (db) => {
  const modes = [
    {
      mode_name: 'product',
      description: 'Focused on Product-Based Companies (Google, Amazon, Microsoft)',
      dsa_weight: JSON.stringify({ weight: 0.7 }),
      aptitude_weight: JSON.stringify({ weight: 0.2 }),
      difficulty_preset: 'hard'
    },
    {
      mode_name: 'service',
      description: 'Focused on Service-Based Companies (TCS, Infosys, Wipro)',
      dsa_weight: JSON.stringify({ weight: 0.3 }),
      aptitude_weight: JSON.stringify({ weight: 0.5 }),
      difficulty_preset: 'medium'
    },
    {
      mode_name: 'balanced',
      description: 'Balanced approach for both Product and Service based companies',
      dsa_weight: JSON.stringify({ weight: 0.4 }),
      aptitude_weight: JSON.stringify({ weight: 0.35 }),
      difficulty_preset: 'medium'
    }
  ];

  await db.CompanyMode.bulkCreate(modes);
  console.log('✅ Company Modes Seeded');
};
