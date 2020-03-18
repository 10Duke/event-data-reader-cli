# Event Data reader

Command line tool for reading events from 10Duke Event Data service.

## Usage

```
Usage: event-data-reader [options] <getEndpointUrl> <feed>

Command line tool for reading event data from 10Duke Event Data service. Retrieves event data internally in chunks and writes a single JSON array with all retrieved events.

Options:
  -V, --version                          output the version number
  -a, --after <after>                    Timestamp from which events are requested, in nanoseconds since the Epoch
                                         or as a parseable datetime string (ISO 8601). If not specified, reading
                                         starts from the oldest event.
  -b, --before <before>                  Timestamp until which events are requested, in nanoseconds since the Epoch
                                         or as a parseable datetime string (ISO 8601). If not specified, reads until
                                         no newer events available.
  -k, --key <privateKeyFile>             private key file, used for building authorization token
  -m, --max-event-count <maxEventCount>  maximum number of events to return per request (default: "500")
  -x, --max-rounds <maxRounds>           maximum number of requests to send in order to get all events between
                                         --after and --before, or -1 for unlimited / until all retrieved (default:
                                         "-1")
  -r, --max-retries <maxRetries>         maximum number of retries if a request fails (default: "5")
  -o, --output <filePath>                File for writing events received from the server. If not specified, writes
                                         to stdout.
  -d, --debug                            output debug info (default: no debug output)
  -h, --help                             display help for command

Example call:
  $ event-data-reader https://acme.events.10duke.com/get acme-idp -k acme.private.pem -a 2020-02-15 -b 2020-02-16T12:00:00.000Z -o acme-events.json
```

If running directly from the project without installing the command line tool, instead of using `event-data-reader` use `npm run event-data-reader -- ` (there must be a space after `--`, specify arguments after it).
