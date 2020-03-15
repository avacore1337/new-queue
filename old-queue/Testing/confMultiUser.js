exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  multiCapabilities: [{
    browserName: 'firefox',
    specs: ['specMultiUser.js']
}, {
    browserName: 'firefox',
    specs: ['specMultiUser2.js']
}],
  maxSessions: 2,
}