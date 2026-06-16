(async () => {
  const query = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }`;
  const variables = { titleSlug: 'two-sum' };
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  console.log(json.data.question.content ? 'WORKS:\n' + json.data.question.content.substring(0, 100) : 'FAILED');
})();
