var merge = require('utils-merge');
var TokenError = require('../errors/tokenerror');


module.exports = function(options, issue) {
  if (typeof options == 'function') {
    issue = options;
    options = undefined;
  }
  options = options || {};
  
  if (!issue) { throw new TypeError('oauth2orize.tokenExchange exchange requires an issue callback'); }
  
  var userProperty = options.userProperty || 'user';
  
  // For maximum flexibility, multiple scope spearators can optionally be
  // allowed.  This allows the server to accept clients that separate scope
  // with either space or comma (' ', ',').  This violates the specification,
  // but achieves compatibility with existing client libraries that are already
  // deployed.
  var separators = options.scopeSeparator || ' ';
  if (!Array.isArray(separators)) {
    separators = [ separators ];
  }
  
  
  // https://tools.ietf.org/html/draft-ietf-oauth-token-exchange-05
  
  return function token_exchange(req, res, next) {
    if (!req.body) { return next(new Error('OAuth2orize requires body parsing. Did you forget to use body-parser middleware?')); }
    
    // The 'user' property of `req` holds the authenticated user.  In the case
    // of the token endpoint, the property will contain the OAuth 2.0 client.
    var client = req[userProperty]
      , resource = req.body.resource // optional
      , audience = req.body.audience  // optional
      , scope = req.body.scope // optional
      , requestedTokenType = req.body.requested_token_type // optional
      , subjectToken = req.body.subject_token // required
      , subjectTokenType = req.body.subject_token_type // required
      , actorToken = req.body.actor_token // optional
      , actorTokenType = req.body.actor_token_type // optional
      , wantComposite = req.body.want_composite // removed as of -06
      , targets = [];
    
    if (!subjectToken) { return next(new TokenError('Missing required parameter: subject_token', 'invalid_request')); }
    if (!subjectTokenType) { return next(new TokenError('Missing required parameter: subject_token_type', 'invalid_request')); }
    if (actorToken && !actorTokenType) { return next(new TokenError('Missing required parameter: actor_token_type', 'invalid_request')); }
    
    if (resource && !Array.isArray(resource)) { resource = [ resource ]; }
    if (audience && !Array.isArray(audience)) { audience = [ audience ]; }
    
    // The specification defines `resource` in a way that is functionally a
    // subset of `audience`.  Other specifications define `audience` in a way
    // that is identical to `resource` in this specification.  From a practial,
    // implementation-centric point of view, the two parameters are effectively
    // equivalent, and it is unnecessary complexity to make them discreet.  For
    // developer simplicity, this implementation chooses to collapse these two
    // parameters into a single `targets` array, which represents the requested
    // audience (or audiences).
    if (resource) {
      targets = targets.concat(resource);
    }
    if (audience) {
      targets = targets.concat(audience);
    }
    // TODO:
    //targets = (targets.length ? targets : undefined)
    
    if (scope) {
      for (var i = 0, len = separators.length; i < len; i++) {
        var separated = scope.split(separators[i]);
        // only separate on the first matching separator.  this allows for a sort
        // of separator "priority" (ie, favor spaces then fallback to commas)
        if (separated.length > 1) {
          scope = separated;
          break;
        }
      }
      if (!Array.isArray(scope)) { scope = [ scope ]; }
    }
    
    function issued(err, accessToken, refreshToken, params) {
      if (err) { return next(err); }
      if (!accessToken) { return next(new TokenError('Invalid subject or actor token', 'invalid_request')); }
      if (refreshToken && typeof refreshToken == 'object') {
        params = refreshToken;
        refreshToken = null;
      }

      var tok = {};
      tok.access_token = accessToken;
      // WARNING: In many cases, this exchange is used to exchange a temporary
      //          credential for a different temporary credential.  In such
      //          circumstances, a refresh token should typically not be issued.
      //          Implementers are advised to clearly evaluate the conditions in
      //          which a refresh token is appropriate to issue before doing so.
      if (refreshToken) { tok.refresh_token = refreshToken; }
      if (params) { merge(tok, params); }
      tok.issued_token_type = tok.issued_token_type || 'urn:ietf:params:oauth:token-type:access_token';
      tok.token_type = tok.token_type || (tok.issued_token_type == 'urn:ietf:params:oauth:token-type:access_token' ? 'Bearer' : 'N_A');
      
      var json = JSON.stringify(tok);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');
      res.end(json);
    }
    
    try {
      var hints = {
        subjectTokenType: subjectTokenType,
        actorTokenType: actorTokenType,
        wantComposite: wantComposite,
        resource: resource,
        audience: audience,
        requestedTokenType: requestedTokenType
      }
      
      // TODO: Put scope before audience in arguments
      
      var arity = issue.length;
      if (arity == 8) {
        issue(client, subjectToken, actorToken, hints, scope, req.body, req.authInfo, issued);
      } else if (arity == 7) {
        issue(client, subjectToken, actorToken, hints, scope, req.body, issued);
      } else if (arity == 6) {
        issue(client, subjectToken, actorToken, scope, targets, issued);
      } else if (arity == 5) {
        issue(client, subjectToken, scope, targets, issued);
      } else if (arity == 4) {
        issue(client, subjectToken, scope, issued);
      } else { // arity == 3
        issue(client, subjectToken, issued);
      }
    } catch (ex) {
      return next(ex);
    }
  }
}
