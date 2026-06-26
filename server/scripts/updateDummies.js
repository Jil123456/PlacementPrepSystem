const sequelize = require('./config/database');

async function updateDB() {
  try {
    const aptDesc = `Solve the following mathematical sequence or logic problem based on standard formulas:\n\nIf X = 50 and Y = 50, what is the value of X + Y?`;
    const aptOptions = JSON.stringify([
      {label:'A', text:'100', value:'A'}, 
      {label:'B', text:'150', value:'B'}, 
      {label:'C', text:'50', value:'C'}, 
      {label:'D', text:'0', value:'D'}
    ]);
    const aptExpl = `X + Y = 50 + 50 = 100. Therefore, the correct answer is A.`;

    await sequelize.query(
        "UPDATE questions SET description = :desc, options = :opts, explanation = :expl WHERE category = 'aptitude' AND description LIKE '%generic%'", 
        { replacements: { desc: aptDesc, opts: aptOptions, expl: aptExpl } }
    );

    const coreDesc = `Identify the correct statement regarding this architecture or principle.\n\nWhich of the following is considered a valid characteristic?`;
    const coreOptions = JSON.stringify([
      {label:'A', text:'It ensures data integrity and atomic transactions.', value:'A'}, 
      {label:'B', text:'It allows unbounded memory leaks by design.', value:'B'}, 
      {label:'C', text:'It requires no processing power.', value:'C'}, 
      {label:'D', text:'None of the above', value:'D'}
    ]);

    await sequelize.query(
        "UPDATE questions SET description = :desc, options = :opts WHERE category = 'core_subject' AND description LIKE '%Identify%'", 
        { replacements: { desc: coreDesc, opts: coreOptions } }
    );

    console.log("Dummy questions successfully updated in DB!");
  } catch (err) {
    console.error("Error updating DB:", err);
  } finally {
    process.exit(0);
  }
}

updateDB();
