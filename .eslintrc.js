module.exports = {
  extends: 'airbnb-base',
  rules: {

    // ensure imports point to files/modules that can be resolved
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md
    'import/no-unresolved': 'off',

    // require or disallow trailing commas (comma-dangle)
    'comma-dangle': ['error', 'never'],

    // disallow the unary operators ++ and -- (no-plusplus)
    'no-plusplus': 'off',

    // disallow dangling underscores in identifiers (no-underscore-dangle)
    'no-underscore-dangle': 'off'
  }
};
