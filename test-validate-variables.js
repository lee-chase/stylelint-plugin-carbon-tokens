const stylelint = require('stylelint');

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
  console.log('Warnings:', result.results[0].warnings);
}

test().catch(console.error);
