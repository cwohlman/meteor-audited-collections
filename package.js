Package.describe({
  name: 'cwohlman:audited-collections',
  summary: ' /* Fill me in! */ ',
  version: '0.1.0',
  git: ' /* Fill me in! */ '
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
