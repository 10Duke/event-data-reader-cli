# Event Data reader

Command line tool for reading events from 10Duke Event Data service.

## Usage

```
Usage: event-data-reader [options] <getEndpointUrl> <feed>

Command line tool for reading event data from 10Duke Event Data service.

Options:
  -V, --version                          output the version number
  -a, --after <after>                    Timestamp from which events are requested, in nanoseconds since the Epoch.
                                         If not specified, reading starts from the oldest event.
  -b, --before <before>                  Timestamp until which events are requested, in nanoseconds since the Epoch.
                                         If not specified, reads until no newer events available.
  -k, --key <privateKeyFile>             private key file, used for building authorization token
  -m, --max-event-count <maxEventCount>  maximum number of events to return per request (default: "500")
  -x, --max-rounds <maxRounds>           maximum number of requests to send in order to get all events between
                                         --after and --before, or -1 for unlimited / until all retrieved (default:
                                         "1")
  -r, --max-retries <maxRetries>         maximum number of retries if a request fails (default: "1")
  -o, --output <filePath>                File for writing events received from the server. If not specified, writes
                                         to stdout.
  -d, --debug                            output debug info (default: no debug output)
  -h, --help                             display help for command
```

Example:

```
event-data-reader https://acme.events.10duke.com/get acme-idp -k acme.private.pem -m 500 -x -1 -r 55 -o acme-events.json
```

If running directly from the project without installing the command line tool, instead of using `event-data-reader` to invoke the command use `npm run event-data-reader -- ` (there must be a space after `--`, specify arguments after it).
