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
      function issue(client, subjectToken, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC') { return done(new Error('incorrect subjectToken argument')); }
        
        return done(null, '2YotnFZFEjr1zCsicMWpAA');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1', name: 'frontend.example.com' };
          req.body = {
            subject_token: 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
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
  
  describe('issuing an access token based on scope', function() {
    var response, err;

    before(function(done) {
      function issue(client, subjectToken, scope, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC') { return done(new Error('incorrect subjectToken argument')); }
        if (scope.length !== 1 || scope[0] !== 'email') { return done(new Error('incorrect scope argument')); }
        
        return done(null, '2YotnFZFEjr1zCsicMWpAA');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1', name: 'frontend.example.com' };
          req.body = {
            scope: 'email',
            subject_token: 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
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
  
  describe('issuing an access token based on scope and audience, specified using resource', function() {
    var response, err;

    before(function(done) {
      function issue(client, subjectToken, scope, audience, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC') { return done(new Error('incorrect subjectToken argument')); }
        if (scope.length !== 1 || scope[0] !== 'email') { return done(new Error('incorrect scope argument')); }
        if (audience.length !== 1 ||
            audience[0] !== 'https://backend.example.com/api') {
          return done(new Error('incorrect targets argument'));
        }
        
        return done(null, '2YotnFZFEjr1zCsicMWpAA');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1', name: 'frontend.example.com' };
          req.body = {
            resource: 'https://backend.example.com/api',
            scope: 'email',
            subject_token: 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
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
  
  describe('impersonation token exchange example from -09', function() {
    var response, err;

    before(function(done) {
      function issue(client, subjectToken, scope, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTA2MDAsIm5iZiI6MTQ0MTkwOTAwMCwic3ViIjoiYmNAZXhhbXBsZS5uZXQiLCJzY3AiOlsib3JkZXJzIiwicHJvZmlsZSIsImhpc3RvcnkiXX0.JDe7fZ267iIRXwbFmOugyCt5dmGoy6EeuzNQ3MqDek5cCUlyPhQC6cz9laKjK1bnjMQbLJqWix6ZdBI0isjsTA') { return done(new Error('incorrect subjectToken argument')); }
        //if (scope.length !== 1 || scope[0] !== 'email') { return done(new Error('incorrect scope argument')); }
        
        return done(null, 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm46ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5leGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic3ViIjoiYmNAZXhhbXBsZS5uZXQiLCJzY3AiOlsib3JkZXJzIiwiaGlzdG9yeSIsInByb2ZpbGUiXX0.YQHuLmI1YDTugbfEvgGY2gaGBmMyj9BepZSECCBE9j9ogqZv2qx6VQQPrbT1k7vBYGLNMOkkpmmJkxZDS0YV7g', { expires_in: 3600 });
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1' };
          req.body = {
            audience: 'urn:example:cooperation-context',
            subject_token: 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTA2MDAsIm5iZiI6MTQ0MTkwOTAwMCwic3ViIjoiYmNAZXhhbXBsZS5uZXQiLCJzY3AiOlsib3JkZXJzIiwicHJvZmlsZSIsImhpc3RvcnkiXX0.JDe7fZ267iIRXwbFmOugyCt5dmGoy6EeuzNQ3MqDek5cCUlyPhQC6cz9laKjK1bnjMQbLJqWix6ZdBI0isjsTA',
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
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
      expect(response.body).to.equal('{"access_token":"eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm46ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5leGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic3ViIjoiYmNAZXhhbXBsZS5uZXQiLCJzY3AiOlsib3JkZXJzIiwiaGlzdG9yeSIsInByb2ZpbGUiXX0.YQHuLmI1YDTugbfEvgGY2gaGBmMyj9BepZSECCBE9j9ogqZv2qx6VQQPrbT1k7vBYGLNMOkkpmmJkxZDS0YV7g","expires_in":3600,"token_type":"Bearer","issued_token_type":"urn:ietf:params:oauth:token-type:access_token"}');
    });
  });
  
  describe('delegation token exchange example from -09', function() {
    var response, err;

    before(function(done) {
      function issue(client, subjectToken, scope, done) {
        if (client.id !== '1') { return done(new Error('incorrect client argument')); }
        if (subjectToken !== 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTAwNjAsInNjcCI6WyJzdGF0dXMiLCJmZWVkIl0sInN1YiI6InVzZXJAZXhhbXBsZS5uZXQiLCJtYXlfYWN0Ijp7InN1YiI6ImFkbWluQGV4YW1wbGUubmV0In19.ut0Ll7wm920VzRvuLGLFoPJLeO5DDElxsax1L_xKUm2eooiNSfuif-OGa2382hPyFYnddKIa0wmDhQksW018Rw') { return done(new Error('incorrect subjectToken argument')); }
        if (scope !== undefined) { return done(new Error('incorrect scope argument')); }
        
        return done(null, 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm46ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5leGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic2NwIjpbInN0YXR1cyIsImZlZWQiXSwic3ViIjoidXNlckBleGFtcGxlLm5ldCIsImFjdCI6eyJzdWIiOiJhZG1pbkBleGFtcGxlLm5ldCJ9fQ._qjM7Ij_HcrC78omT4jiZTFJOuzsAj1wPo31ymQS-Suqr64S1jCp6pfQR-in_OOAosAGamEg4jyPsht6kMAiYA', { issued_token_type: 'urn:ietf:params:oauth:token-type:jwt', expires_in: 3600 });
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1' };
          req.body = {
            audience: 'urn:example:cooperation-context',
            subject_token: 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTAwNjAsInNjcCI6WyJzdGF0dXMiLCJmZWVkIl0sInN1YiI6InVzZXJAZXhhbXBsZS5uZXQiLCJtYXlfYWN0Ijp7InN1YiI6ImFkbWluQGV4YW1wbGUubmV0In19.ut0Ll7wm920VzRvuLGLFoPJLeO5DDElxsax1L_xKUm2eooiNSfuif-OGa2382hPyFYnddKIa0wmDhQksW018Rw',
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            actor_token: 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjE2In0.eyJhdWQiOiJodHRwczovL2FzLmV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9vcmlnaW5hbC1pc3N1ZXIuZXhhbXBsZS5uZXQiLCJleHAiOjE0NDE5MTAwNjAsInN1YiI6ImFkbWluQGV4YW1wbGUubmV0In0.7YQ-3zPfhUvzje5oqw8COCvN5uP6NsKik9CVV6cAOf4QKgM-tKfiOwcgZoUuDL2tEs6tqPlcBlMjiSzEjm3yBg',
            actor_token_type: 'urn:ietf:params:oauth:token-type:jwt'
          };
        })
        .end(function(res) {
          response = res;
          done();
        })
        .next(function(err) {
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
      expect(response.body).to.equal('{"access_token":"eyJhbGciOiJFUzI1NiIsImtpZCI6IjcyIn0.eyJhdWQiOiJ1cm46ZXhhbXBsZTpjb29wZXJhdGlvbi1jb250ZXh0IiwiaXNzIjoiaHR0cHM6Ly9hcy5leGFtcGxlLmNvbSIsImV4cCI6MTQ0MTkxMzYxMCwic2NwIjpbInN0YXR1cyIsImZlZWQiXSwic3ViIjoidXNlckBleGFtcGxlLm5ldCIsImFjdCI6eyJzdWIiOiJhZG1pbkBleGFtcGxlLm5ldCJ9fQ._qjM7Ij_HcrC78omT4jiZTFJOuzsAj1wPo31ymQS-Suqr64S1jCp6pfQR-in_OOAosAGamEg4jyPsht6kMAiYA","issued_token_type":"urn:ietf:params:oauth:token-type:jwt","expires_in":3600,"token_type":"Bearer"}');
    });
  });
  
  describe('handling a request without subject_token parameter', function() {
    var err;

    before(function(done) {
      function issue(client, subjectToken, done) {
        return done(null, 'IGNORE');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1' };
          req.body = { subject_token_type: 'urn:ietf:params:oauth:token-type:access_token' };
        })
        .next(function(e) {
          err = e;
          done();
        })
        .dispatch();
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal('Missing required parameter: subject_token');
      expect(err.code).to.equal('invalid_request');
      expect(err.status).to.equal(400);
    });
  });
  
  describe('handling a request without subject_token_type parameter', function() {
    var err;

    before(function(done) {
      function issue(client, subjectToken, done) {
        return done(null, 'IGNORE');
      }
      
      chai.connect.use(tokenExchange(issue))
        .req(function(req) {
          req.user = { id: '1' };
          req.body = { subject_token: 'accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC' };
        })
        .next(function(e) {
          err = e;
          done();
        })
        .dispatch();
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal('Missing required parameter: subject_token_type');
      expect(err.code).to.equal('invalid_request');
      expect(err.status).to.equal(400);
    });
  });
  
});
