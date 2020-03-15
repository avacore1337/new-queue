exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['specQueue.js'],

  multiCapabilities: [ 
 //{browserName: 'firefox'},
  {
  	browserName: 'chrome'}
  ],

  maxSessions: 1,
}