/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-between-library-innards',
      from: { path: "^src/libraries/([^/]+)/.+" },
      to: {
        path: "^src/libraries/([^/]+)/.+",
        pathNot: ["^src/libraries/([^/]+)/index.ts", "^src/libraries/$1/.+"]
      }
    },
    {
      name: 'no-library-innards',
      from: {
        path: "^src/.+",
        pathNot: "^src/libraries/.+"
      },
      to: {
        path: "^src/libraries/([^/]+)/.+",
        pathNot: ["^src/libraries/([^/]+)/index.ts"]
      }
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        'module: add it to your package.json. In all other cases you likely already know what to do.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true
      }
    }
  ],
  options: {

    /* conditions specifying which files not to follow further when encountered:
       - path: a regular expression to match
       - dependencyTypes: see https://github.com/sverweij/dependency-cruiser/blob/master/doc/rules-reference.md#dependencytypes-and-dependencytypesnot
       for a complete list
    */
    doNotFollow: {
      path: 'node_modules'
    },
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
