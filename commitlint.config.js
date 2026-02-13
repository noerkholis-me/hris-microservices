/**
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports =  {
  extends: [
    '@commitlint/config-conventional'
  ],

  parserPreset: {
    parserOpts: {
      // Regex ini mendukung: ":emoji: type(scope): subject" ATAU "type(scope): subject"
      // Gitmoji opsional di awal: (?:(:[\w\-]+:|[^\x00-\x7F]+)\s)?
      // eslint-disable-next-line no-control-regex
      headerPattern: /^(?:(:[\w\-]+:|[^\x00-\x7F]+)\s)?(\w+)(?:\(([^)]+)\))?!?: (.+)$/,
      headerCorrespondence: ["emoji", "type", "scope", "subject"],
    },
  },
  
  rules: {
    // Type rules
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation only
        'style',     // Formatting, missing semi-colons, etc.
        'refactor',  // Code change that neither fixes a bug nor adds a feature
        'perf',      // Performance improvement
        'test',      // Adding or updating tests
        'build',     // Build system or dependencies
        'ci',        // CI/CD changes
        'chore',     // Other changes (e.g., updating dependencies)
        'revert',    // Revert a previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope rules
    'scope-enum': [
      2,
      'always',
      [
        // Microservices (use service name without '-service' suffix)
        'auth',
        'employee',
        'attendance',
        'leave',
        'payroll',
        'notification',
        'gateway',
        
        // Frontend
        'web',
        
        // Shared packages
        'common',
        'contracts',
        'events',
        'eslint-config',
        'jest-config',
        'ts-config',
        'prettier-config',
        
        // Infrastructure
        'docker',
        'prisma',
        'turborepo',
        'deps',
        'ci',
        
        // Database
        'migration',
        'seed',
        
        // Testing
        'e2e',
        'unit',
        'integration',
        
        // Documentation
        'readme',
        'adr',
        'api-docs',
        'guide',

        'husky',
        'commitlint',
        'lint-staged',
        'prettier',
        'turborepo',
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    
    // Subject rules
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    
    // Header rules
    'header-max-length': [2, 'always', 100],
    
    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 72],
    
    // Footer rules
    'footer-leading-blank': [2, 'always'],
  },
};
