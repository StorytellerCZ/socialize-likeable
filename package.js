/* global Package */
Package.describe({
    name: 'socialize:likeable',
    summary: 'A package implementing social "liking" or "starring"',
    version: '2.0.0',
    git: 'https://github.com/copleykj/socialize-likeable.git',
});

Package.onUse(function _(api) {
    api.versionsFrom(['2.8.1']);

    api.use([
        'socialize:user-blocking@2.0.0',
        'reywood:publish-composite@1.8.9',
        'aldeed:simple-schema@1.13.1'
    ]);

    api.imply('socialize:user-blocking');

    api.mainModule('server/server.js', 'server');
    api.mainModule('common/common.js', 'client');
});
