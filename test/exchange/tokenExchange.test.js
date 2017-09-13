var chai = require('chai')
  , tokenExchange = require('../../lib/exchange/tokenExchange');


describe('exchange.tokenExchange', function() {
  
  it('should be unnamed', function() {
    expect(tokenExchange(function(){}).name).to.equal('');
  });
  
  it('should throw if constructed without a issue callback', function() {
    expect(function() {
      tokenExchange();
    }).to.throw(TypeError, 'oauth2orize.tokenExchange exchange requires an issue callback');
  });
  
  describe('issuing an access token', function() {
    var response, err;

    before(function(done) {
      function issue(client, subjectToken, hints, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC') { return done(new Error('incorrect subjectToken argument')); }
        return done(null, '2YotnFZFEjr1zCsicMWpAA');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1', name: 'Frontend Service' };
          req.body = {
            resource: 'https://backend.example.com/api',
            subject_token: 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
          console.log(err);
          console.log(err.stack);
          throw err;
        })
        .dispatch();
    });
    
    it('should respond with headers', function() {
      expect(response.getHeader('Content-Type')).to.equal('application/json');
      expect(response.getHeader('Cache-Control')).to.equal('no-store');
      expect(response.getHeader('Pragma')).to.equal('no-cache');
    });
    
    it('should respond with body', function() {
      expect(response.body).to.equal('{"access_token":"2YotnFZFEjr1zCsicMWpAA","token_type":"Bearer","issued_token_type":"urn:ietf:params:oauth:token-type:access_token"}');
    });
  });
  
});
