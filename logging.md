# Logging

For node, loglevel (https://github.com/pimterry/loglevel ) is great for controlling logging verbosity. E.g.:

```
...
var log = null

exports.handler = function (event, context, callback) {
  log = require('loglevel')
  log.setLevel(process.env['LOGLEVEL'] || 'info')

  log.info('Loading Document Stream Listener')
  ...
```

Keep your log perusal sane by reporting only a couple big headline events to `log.info`, minunitae that might be helpful to debug to `log.debug`, and errors to `log.error`. 

## Errors

Types of errors that can occur:

 - missing/invalid config (e.g. invalid encrypted connection string)
 - invalid aws permissions (e.g. someone modifies the security group)
 - transient network issues effecting db, elasticsearch, or api connectivity 
 - db schema changes without backwards code compatibility
 - stale cached tokens like db connections, oauth tokens, other frozen data
 - simple application errors like array-index-out-of-bounds or undefined objects arising from invalid assumptions about otherwise valid avro documents
 - database/http lookups built dynamically using event data (e.g. event specifies a record id that doesn't exist)

Some errors are transient, environmental conditions that have nothing to do with the input. Some are data-specific. Whether we flag a given lambda invocation as an error or not depends on our app and the kind of error. The lambda environment has a simple method to indicate the success/failure of a given invocation:

```
exports.handler = function (event, context, callback) {
  try {
    // do work
    ...
    callback(null, [success message])
  } catch(e) {
    callback([truthy])
  }
```

Passing anything truthy to the callback will flag the invocation as an error. The policy for replaying the event after a few seconds depends on the class of trigger.

### Ensuring errors are replayed:

For stream-based invocations we can rely on existing default behavior that replays any event that receives an error against the lambda before processing any later event (to ensure the the events are played in the right order).

"For stream-based event sources (Amazon Kinesis Streams and DynamoDB streams), AWS Lambda polls your stream and invokes your Lambda function. Therefore, if a Lambda function fails, AWS Lambda attempts to process the erring batch of records until the time the data expires, which can be up to seven days for Amazon Kinesis Streams. The exception is treated as blocking, and AWS Lambda will not read any new records from the stream until the failed batch of records either expires or processed successfully. This ensures that AWS Lambda processes the stream events in order. " ( http://docs.aws.amazon.com/lambda/latest/dg/retries-on-errors.html )

That a single error will block later events from being processed in stream-based triggers is both a power and a challenge. On one hand it means that transient connectivity issues that impact all events in the stream will hault work until the issues resolve - without logging thousands of meaninglessly distinct errors. The downside is that the same policy applies when the error is local to an event; If an event contains data that produces an error in the lambda (like a bad id), this will cause all later events to block. When building URLs or db queries based on incoming data, make sure that 404s and database misses don't throw errors that are returned to the `callback`.

For non-stream async events (I assume S3 listeners invoke lambda async) the event will be re-played exactly twice more before being forgotten (http://docs.aws.amazon.com/lambda/latest/dg/retries-on-errors.html ). Thus, we should configure a DLQ (dead letter queue) for any such lambda: http://docs.aws.amazon.com/lambda/latest/dg/dlq.html . We'll need to ensure we set up SNS/SQS (prob the latter) and schedule them to be flushed regularly. This begs the question of how to align a DLQ as a secondary trigger to a lambda with another primary non-stream trigger (e.g. S3). It may be important to ensure a DLQ is flushed *first* before processing events from the primary source. I wasn't able to find formal support for this.

### On concurrent limits:

For non-stream based events, we're limited per region to 400, so if 500 records are uploaded to S3, we will immediately hit the limit for a lambda listening on that event. In that case at least 100 (more if other lambdas are running) events will be queued and played later until concurrent execution allows - up to 6 hours later.

For stream based events, a max of one lambda is assigned to each shard, so an influx of events will likely trigger throttling, which will simply queue the events in order until they can be played. Retention period is tied to the stream (i.e. kinesis retention time)

### Ensuring errors are meaningful:

Don't just throw Errors. Throw custom errors:

https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html#nodejs-prog-model-custom-exceptions
