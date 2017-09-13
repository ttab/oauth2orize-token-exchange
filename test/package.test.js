/* global describe, it */

var pkg = require('..');
var expect = require('chai').expect;


describe('oauth2orize-device-code', function() {
  
  it('should export exchanges', function() {
    expect(pkg.exchange).to.be.an('object');
    expect(pkg.exchange.tokenExchange).to.be.a('function');
  });
  
  it('should alias exchanges', function() {
    expect(pkg.exchange.sts).to.equal(pkg.exchange.tokenExchange);
  });
  
});
