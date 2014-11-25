Package.describe({
  name: 'cwohlman:audited-collections',
  summary: 'Timestamps and logging for mongo collections.',
  version: "0.1.2",
  git: 'https://github.com/cwohlman/meteor-audited-collections.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('mongo');
  api.use('underscore');
  api.use('matb33:collection-hooks@0.7.6');

  api.addFiles('audited-collections.js');

  api.export(['AuditedCollection', 'AuditLogs']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('cwohlman:audited-collections');
  api.addFiles('audited-collections-tests.js');
});
