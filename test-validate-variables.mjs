import stylelint from 'stylelint';

async function test() {
  const result = await stylelint.lint({
    code: '.test { margin: $my-component-spacing; }',
    config: {
      plugins: ['./dist/index.js'],
      rules: {
        'carbon/layout-use': [
          true,
          { validateVariables: ['$my-component-spacing'] },
        ],
      },
    },
  });

  console.log('Errored:', result.errored);
  console.log('Results:', JSON.stringify(result.results, null, 2));
}

test().catch(console.error);
