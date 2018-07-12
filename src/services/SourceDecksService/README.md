# SourceDecksService

Serves requests for source decks.

Async requests can be tokenized.

Untokenized async requests served normally.

Behaviour per tokenId depending on mode:
 * `DISCARD_THIS_IF_ANY_PENDING` - if any pending requests then this
   request is not submitted
 * `DISCARD_PREV` - if any pending requests then those will
   throw `Error(swallowed)`
 * `SERVE_FIRST_RESOLVED` - request is submitted, first resolved
   will discard other pending

When a tokenized request resolves but cannot find itself among registered
requests it gets swallowed.

When tokenized request arrives:
1. if token not registered yet then
   `_registeredAsyncRequests[tokenId] = { requestCount: 0, aliveRequestIds: {} }`
2. if `mode === DISCARD_THIS_IF_ANY_PENDING` then throw Swallow
3. if `mode === DISCARD_PREV` then
   `_registeredAsyncRequests[tokenId].aliveRequestIds = { [++.requestCount] = .requestCount }`
3. if `mode === SERVE_FIRST_RESOLVED` (or no token) then
   `_registeredAsyncRequests[tokenId].aliveRequestIds[++.requestCount] = .requestCount`

On tokenized request resolution:
1. if `_registeredAsyncRequests[tokenId].aliveRequestIds` contains no request id
    then it throws `Error(swallowed)`
2. if `_registeredAsyncRequests[tokenId].aliveRequestIds` contains the request id then
   - mode === SERVE_FIRST_RESOLVED ? `_registeredAsyncRequests[tokenId].aliveRequestIds = {}`
     : `delete .aliveRequestIds[requestId]`
   - serve response

On discardPendingAsyncRequests `_registeredAsyncRequests[tokenId].aliveRequestIds = {}`


When to use:
If a component at some point submits a request and from all possible requests
only the latest is important
then create a token with mode `DISCARD_PREV` to be used at this point.
Then every subsequent request will discard
all pending (submitted and not resolved yet) requests from this point
will be discarded.

In e.g. ReactJS apps (in component static gDSFP() method) you will want to
1) discardPendingAsyncRequests for previous token (if exists), and
2) create a new token on targeted subject update

Use mode `SERVE_FIRST_RESOLVED` when you request same data from e
.g. different sources. This method is harder to manage.

Use mode `DISCARD_THIS_IF_ANY_PENDING` when you want duplicate requests
not to be submitted.
