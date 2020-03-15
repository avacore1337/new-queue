describe('Basic Queue Functionality:', function() {
var name = 'emickos';
var location = 'Red';
var ta = 'pernyb';
var browsers = [];
var queue = 'dbas';

 beforeEach(function() {
    browser.manage().deleteAllCookies();
    browser.get('http://localhost:8080/#/list');
    browser.manage().window().maximize();
    browser.waitForAngular();
      });


 function userLogInAndJoinQueue(userName, joinQueue){
  element(by.id('indexLogInBtn')).isDisplayed().then(function(isVisible) {
      if (isVisible){  
        element(by.id('indexLogInBtn')).click();
      } else {  
        element(by.id('indexLogOutBtn')).click();
        element(by.id('indexLogInBtn')).click();  
      }
    });
  element(by.id('loginInputField')).sendKeys(userName);
  element(by.id('loginOKBtn')).click();
  element(by.id('list'+joinQueue+'Btn')).click();
  closeMOTD();
  element(by.id('queueLocationInputField')).sendKeys(location);
  element(by.id('queueJoinQueueBtn')).click();
 };

 function newUserInBrowser(userName, joinQueue, number){
  browsers[number].element(by.id('indexLogInBtn')).isDisplayed().then(function(isVisible) {
      if (isVisible){  
        browsers[number].element(by.id('indexLogInBtn')).click();
      } else {  
        browsers[number].element(by.id('indexLogOutBtn')).click();
        browsers[number].element(by.id('indexLogInBtn')).click();  
      }
    });
  browsers[number].element(by.id('loginInputField')).sendKeys(userName);
  browsers[number].element(by.id('loginOKBtn')).click();
  browsers[number].element(by.id('list'+joinQueue+'Btn')).click();
  browsers[number].actions()
      .mouseMove({x: 400, y: 0}) // 400px to the right of current location
      .click()
      .perform();
  browsers[number].element(by.id('queueLocationInputField')).sendKeys(location);
  browsers[number].element(by.id('queueJoinQueueBtn')).click();
 };


 function closeMOTD(){
    var plot0 = element(by.css('body > div.modal.fade.ng-isolate-scope.in > div > div'));
    browser.actions()
      .mouseMove({x: 400, y: 0}) // 400px to the right of current location
      .click()
      .perform();
};



it('10 users', function(){
    userLogInAndJoinQueue('1b', queue);
  for (var i = 2; i < 20; i++){
    var multiName = i+'b';
    browsers[i] = browser.forkNewDriverInstance('http://localhost:8080/#/list');
    browsers[i].manage().window().maximize();
    browsers[i].waitForAngular();
    browsers[i].actions()
      .mouseMove({x: 400, y: 0}) // 400px to the right of current location
      .click()
      .perform();
    newUserInBrowser(multiName, queue, i);
  }
  browser.pause();
},600000);

});