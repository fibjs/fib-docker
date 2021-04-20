/*jshint -W069 */
/**
 * The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

 * @class Docker
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var Docker = (function(){
    'use strict';

    var http = require('http');
    var util = require('util');

    function Docker(options){
        var domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : '';
        if(this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
        this.headers = options.headers || {};
    }

    function mergeQueryParams(parameters, queryParameters) {
        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                  .forEach(function(parameterName) {
                      var parameter = parameters.$queryParameters[parameterName];
                      queryParameters[parameterName] = parameter;
            });
        }
        return queryParameters;
    }

    function request(method, url, parameters, body, headers, queryParameters, form) {
        var req = {};

        if(Object.keys(queryParameters).length > 0) {
            req.query = queryParameters;
        }
        if(Object.keys(headers).length > 0) {
            req.headers = headers;
        }

        if(Object.keys(form).length > 0) {
            req.body = form;
        }else if(typeof(body) === 'object' && !(body instanceof Buffer)) {
            if(Object.keys(body).length > 0) {
                req.json = body;
            }
        } else if(body) {
            req.body = body;
        }

        var response = http.request(method, url, req);

        if (response.statusCode >= 200 && response.statusCode <= 299) {
            return response.data;
        }

        throw new Error(response.data);
    }


        /**
         * Returns a list of containers. For details on the format, see the
[inspect endpoint](#operation/ContainerInspect).

Note that it uses a different, smaller representation of a container
than inspecting a single container. For example, the list of linked
containers is not propagated .

         * @method
         * @name Docker#ContainerList
         * @param {object} parameters - method options and parameters
             * @param {boolean} parameters.all - Return all containers. By default, only running containers are shown.

             * @param {integer} parameters.limit - Return this number of most recently created containers, including
non-running ones.

             * @param {boolean} parameters.size - Return the size of container as fields `SizeRw` and `SizeRootFs`.

             * @param {string} parameters.filters - Filters to process on the container list, encoded as JSON (a
`map[string][]string`). For example, `{"status": ["paused"]}` will
only return paused containers.

Available filters:

- `ancestor`=(`<image-name>[:<tag>]`, `<image id>`, or `<image@digest>`)
- `before`=(`<container id>` or `<container name>`)
- `expose`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
- `exited=<int>` containers with exit code of `<int>`
- `health`=(`starting`|`healthy`|`unhealthy`|`none`)
- `id=<ID>` a container's ID
- `isolation=`(`default`|`process`|`hyperv`) (Windows daemon only)
- `is-task=`(`true`|`false`)
- `label=key` or `label="key=value"` of a container label
- `name=<name>` a container's name
- `network`=(`<network id>` or `<network name>`)
- `publish`=(`<port>[/<proto>]`|`<startport-endport>/[<proto>]`)
- `since`=(`<container id>` or `<container name>`)
- `status=`(`created`|`restarting`|`running`|`removing`|`paused`|`exited`|`dead`)
- `volume`=(`<volume name>` or `<mount point destination>`)

         */
         Docker.prototype.ContainerList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['all'] !== undefined){
                            queryParameters['all'] = parameters['all'];
                        }
                
                
                


         

                        if(parameters['limit'] !== undefined){
                            queryParameters['limit'] = parameters['limit'];
                        }
                
                
                


         

                        if(parameters['size'] !== undefined){
                            queryParameters['size'] = parameters['size'];
                        }
                
                
                


         

                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a container
         * @method
         * @name Docker#ContainerCreate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Assign the specified name to the container. Must match
`/?[a-zA-Z0-9][a-zA-Z0-9_.-]+`.

             * @param {} parameters.body - Container to create
         */
         Docker.prototype.ContainerCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['name'] !== undefined){
                            queryParameters['name'] = parameters['name'];
                        }
                
                
                


         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Return low-level information about a container.
         * @method
         * @name Docker#ContainerInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {boolean} parameters.size - Return the size of container as fields `SizeRw` and `SizeRootFs`
         */
         Docker.prototype.ContainerInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['size'] !== undefined){
                            queryParameters['size'] = parameters['size'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * On Unix systems, this is done by running the `ps` command. This endpoint
is not supported on Windows.

         * @method
         * @name Docker#ContainerTop
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.psArgs - The arguments to pass to `ps`. For example, `aux`
         */
         Docker.prototype.ContainerTop = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/top';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                            /** set default value **/
                            queryParameters['ps_args'] = -ef;

                        if(parameters['psArgs'] !== undefined){
                            queryParameters['ps_args'] = parameters['psArgs'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get `stdout` and `stderr` logs from a container.

Note: This endpoint works only for containers with the `json-file` or
`journald` logging driver.

         * @method
         * @name Docker#ContainerLogs
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {boolean} parameters.follow - Keep connection after returning logs.
             * @param {boolean} parameters.stdout - Return logs from `stdout`
             * @param {boolean} parameters.stderr - Return logs from `stderr`
             * @param {integer} parameters.since - Only return logs since this time, as a UNIX timestamp
             * @param {integer} parameters.until - Only return logs before this time, as a UNIX timestamp
             * @param {boolean} parameters.timestamps - Add timestamps to every log line
             * @param {string} parameters.tail - Only return this number of log lines from the end of the logs.
Specify as an integer or `all` to output all log lines.

         */
         Docker.prototype.ContainerLogs = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/logs';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['follow'] !== undefined){
                            queryParameters['follow'] = parameters['follow'];
                        }
                
                
                


         

                        if(parameters['stdout'] !== undefined){
                            queryParameters['stdout'] = parameters['stdout'];
                        }
                
                
                


         

                        if(parameters['stderr'] !== undefined){
                            queryParameters['stderr'] = parameters['stderr'];
                        }
                
                
                


         

                        if(parameters['since'] !== undefined){
                            queryParameters['since'] = parameters['since'];
                        }
                
                
                


         

                        if(parameters['until'] !== undefined){
                            queryParameters['until'] = parameters['until'];
                        }
                
                
                


         

                        if(parameters['timestamps'] !== undefined){
                            queryParameters['timestamps'] = parameters['timestamps'];
                        }
                
                
                


         
                            /** set default value **/
                            queryParameters['tail'] = all;

                        if(parameters['tail'] !== undefined){
                            queryParameters['tail'] = parameters['tail'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Returns which files in a container's filesystem have been added, deleted,
or modified. The `Kind` of modification can be one of:

- `0`: Modified
- `1`: Added
- `2`: Deleted

         * @method
         * @name Docker#ContainerChanges
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
         */
         Docker.prototype.ContainerChanges = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/changes';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Export the contents of a container as a tarball.
         * @method
         * @name Docker#ContainerExport
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
         */
         Docker.prototype.ContainerExport = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/export';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/octet-stream'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * This endpoint returns a live stream of a container’s resource usage
statistics.

The `precpu_stats` is the CPU statistic of the *previous* read, and is
used to calculate the CPU usage percentage. It is not an exact copy
of the `cpu_stats` field.

If either `precpu_stats.online_cpus` or `cpu_stats.online_cpus` is
nil then for compatibility with older daemons the length of the
corresponding `cpu_usage.percpu_usage` array should be used.

On a cgroup v2 host, the following fields are not set
* `blkio_stats`: all fields other than `io_service_bytes_recursive`
* `cpu_stats`: `cpu_usage.percpu_usage`
* `memory_stats`: `max_usage` and `failcnt`
Also, `memory_stats.stats` fields are incompatible with cgroup v1.

To calculate the values shown by the `stats` command of the docker cli tool
the following formulas can be used:
* used_memory = `memory_stats.usage - memory_stats.stats.cache`
* available_memory = `memory_stats.limit`
* Memory usage % = `(used_memory / available_memory) * 100.0`
* cpu_delta = `cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage`
* system_cpu_delta = `cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage`
* number_cpus = `lenght(cpu_stats.cpu_usage.percpu_usage)` or `cpu_stats.online_cpus`
* CPU usage % = `(cpu_delta / system_cpu_delta) * number_cpus * 100.0`

         * @method
         * @name Docker#ContainerStats
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {boolean} parameters.stream - Stream the output. If false, the stats will be output once and then
it will disconnect.

             * @param {boolean} parameters.oneShot - Only get a single stat instead of waiting for 2 cycles. Must be used
with `stream=false`.

         */
         Docker.prototype.ContainerStats = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/stats';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                            /** set default value **/
                            queryParameters['stream'] = true;

                        if(parameters['stream'] !== undefined){
                            queryParameters['stream'] = parameters['stream'];
                        }
                
                
                


         

                        if(parameters['oneShot'] !== undefined){
                            queryParameters['one-shot'] = parameters['oneShot'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Resize the TTY for a container.
         * @method
         * @name Docker#ContainerResize
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {integer} parameters.h - Height of the TTY session in characters
             * @param {integer} parameters.w - Width of the TTY session in characters
         */
         Docker.prototype.ContainerResize = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/resize';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['text/plain'];
                headers['content-type'] = ['application/octet-stream'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['h'] !== undefined){
                            queryParameters['h'] = parameters['h'];
                        }
                
                
                


         

                        if(parameters['w'] !== undefined){
                            queryParameters['w'] = parameters['w'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Start a container
         * @method
         * @name Docker#ContainerStart
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.detachKeys - Override the key sequence for detaching a container. Format is a
single character `[a-Z]` or `ctrl-<value>` where `<value>` is one
of: `a-z`, `@`, `^`, `[`, `,` or `_`.

         */
         Docker.prototype.ContainerStart = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/start';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['detachKeys'] !== undefined){
                            queryParameters['detachKeys'] = parameters['detachKeys'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Stop a container
         * @method
         * @name Docker#ContainerStop
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {integer} parameters.t - Number of seconds to wait before killing the container
         */
         Docker.prototype.ContainerStop = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/stop';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['t'] !== undefined){
                            queryParameters['t'] = parameters['t'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Restart a container
         * @method
         * @name Docker#ContainerRestart
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {integer} parameters.t - Number of seconds to wait before killing the container
         */
         Docker.prototype.ContainerRestart = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/restart';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['t'] !== undefined){
                            queryParameters['t'] = parameters['t'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Send a POSIX signal to a container, defaulting to killing to the
container.

         * @method
         * @name Docker#ContainerKill
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.signal - Signal to send to the container as an integer or string (e.g. `SIGINT`)
         */
         Docker.prototype.ContainerKill = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/kill';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                            /** set default value **/
                            queryParameters['signal'] = SIGKILL;

                        if(parameters['signal'] !== undefined){
                            queryParameters['signal'] = parameters['signal'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Change various configuration options of a container without having to
recreate it.

         * @method
         * @name Docker#ContainerUpdate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {} parameters.update - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.ContainerUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['update'] !== undefined){
                        body = parameters['update'];
                    }


                if(parameters['update'] === undefined)
                    throw new Error('Missing required  parameter: update');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Rename a container
         * @method
         * @name Docker#ContainerRename
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.name - New name for the container
         */
         Docker.prototype.ContainerRename = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/rename';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['name'] !== undefined){
                            queryParameters['name'] = parameters['name'];
                        }
                
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Use the freezer cgroup to suspend all processes in a container.

Traditionally, when suspending a process the `SIGSTOP` signal is used,
which is observable by the process being suspended. With the freezer
cgroup the process is unaware, and unable to capture, that it is being
suspended, and subsequently resumed.

         * @method
         * @name Docker#ContainerPause
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
         */
         Docker.prototype.ContainerPause = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/pause';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Resume a container which has been paused.
         * @method
         * @name Docker#ContainerUnpause
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
         */
         Docker.prototype.ContainerUnpause = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/unpause';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Attach to a container to read its output or send it input. You can attach
to the same container multiple times and you can reattach to containers
that have been detached.

Either the `stream` or `logs` parameter must be `true` for this endpoint
to do anything.

See the [documentation for the `docker attach` command](https://docs.docker.com/engine/reference/commandline/attach/)
for more details.

### Hijacking

This endpoint hijacks the HTTP connection to transport `stdin`, `stdout`,
and `stderr` on the same socket.

This is the response from the daemon for an attach request:

```
HTTP/1.1 200 OK
Content-Type: application/vnd.docker.raw-stream

[STREAM]
```

After the headers and two new lines, the TCP connection can now be used
for raw, bidirectional communication between the client and server.

To hint potential proxies about connection hijacking, the Docker client
can also optionally send connection upgrade headers.

For example, the client sends this request to upgrade the connection:

```
POST /containers/16253994b7c4/attach?stream=1&stdout=1 HTTP/1.1
Upgrade: tcp
Connection: Upgrade
```

The Docker daemon will respond with a `101 UPGRADED` response, and will
similarly follow with the raw stream:

```
HTTP/1.1 101 UPGRADED
Content-Type: application/vnd.docker.raw-stream
Connection: Upgrade
Upgrade: tcp

[STREAM]
```

### Stream format

When the TTY setting is disabled in [`POST /containers/create`](#operation/ContainerCreate),
the stream over the hijacked connected is multiplexed to separate out
`stdout` and `stderr`. The stream consists of a series of frames, each
containing a header and a payload.

The header contains the information which the stream writes (`stdout` or
`stderr`). It also contains the size of the associated frame encoded in
the last four bytes (`uint32`).

It is encoded on the first eight bytes like this:

```go
header := [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}
```

`STREAM_TYPE` can be:

- 0: `stdin` (is written on `stdout`)
- 1: `stdout`
- 2: `stderr`

`SIZE1, SIZE2, SIZE3, SIZE4` are the four bytes of the `uint32` size
encoded as big endian.

Following the header is the payload, which is the specified number of
bytes of `STREAM_TYPE`.

The simplest way to implement this protocol is the following:

1. Read 8 bytes.
2. Choose `stdout` or `stderr` depending on the first byte.
3. Extract the frame size from the last four bytes.
4. Read the extracted size and output it on the correct output.
5. Goto 1.

### Stream format when using a TTY

When the TTY setting is enabled in [`POST /containers/create`](#operation/ContainerCreate),
the stream is not multiplexed. The data exchanged over the hijacked
connection is simply the raw data from the process PTY and client's
`stdin`.

         * @method
         * @name Docker#ContainerAttach
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.detachKeys - Override the key sequence for detaching a container.Format is a single
character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`,
`@`, `^`, `[`, `,` or `_`.

             * @param {boolean} parameters.logs - Replay previous logs from the container.

This is useful for attaching to a container that has started and you
want to output everything since the container started.

If `stream` is also enabled, once all the previous output has been
returned, it will seamlessly transition into streaming current
output.

             * @param {boolean} parameters.stream - Stream attached streams from the time the request was made onwards.

             * @param {boolean} parameters.stdin - Attach to `stdin`
             * @param {boolean} parameters.stdout - Attach to `stdout`
             * @param {boolean} parameters.stderr - Attach to `stderr`
         */
         Docker.prototype.ContainerAttach = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/attach';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/vnd.docker.raw-stream'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['detachKeys'] !== undefined){
                            queryParameters['detachKeys'] = parameters['detachKeys'];
                        }
                
                
                


         

                        if(parameters['logs'] !== undefined){
                            queryParameters['logs'] = parameters['logs'];
                        }
                
                
                


         

                        if(parameters['stream'] !== undefined){
                            queryParameters['stream'] = parameters['stream'];
                        }
                
                
                


         

                        if(parameters['stdin'] !== undefined){
                            queryParameters['stdin'] = parameters['stdin'];
                        }
                
                
                


         

                        if(parameters['stdout'] !== undefined){
                            queryParameters['stdout'] = parameters['stdout'];
                        }
                
                
                


         

                        if(parameters['stderr'] !== undefined){
                            queryParameters['stderr'] = parameters['stderr'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Attach to a container via a websocket
         * @method
         * @name Docker#ContainerAttachWebsocket
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.detachKeys - Override the key sequence for detaching a container.Format is a single
character `[a-Z]` or `ctrl-<value>` where `<value>` is one of: `a-z`,
`@`, `^`, `[`, `,`, or `_`.

             * @param {boolean} parameters.logs - Return logs
             * @param {boolean} parameters.stream - Return stream
             * @param {boolean} parameters.stdin - Attach to `stdin`
             * @param {boolean} parameters.stdout - Attach to `stdout`
             * @param {boolean} parameters.stderr - Attach to `stderr`
         */
         Docker.prototype.ContainerAttachWebsocket = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/attach/ws';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['detachKeys'] !== undefined){
                            queryParameters['detachKeys'] = parameters['detachKeys'];
                        }
                
                
                


         

                        if(parameters['logs'] !== undefined){
                            queryParameters['logs'] = parameters['logs'];
                        }
                
                
                


         

                        if(parameters['stream'] !== undefined){
                            queryParameters['stream'] = parameters['stream'];
                        }
                
                
                


         

                        if(parameters['stdin'] !== undefined){
                            queryParameters['stdin'] = parameters['stdin'];
                        }
                
                
                


         

                        if(parameters['stdout'] !== undefined){
                            queryParameters['stdout'] = parameters['stdout'];
                        }
                
                
                


         

                        if(parameters['stderr'] !== undefined){
                            queryParameters['stderr'] = parameters['stderr'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Block until a container stops, then returns the exit code.
         * @method
         * @name Docker#ContainerWait
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.condition - Wait until a container state reaches the given condition, either
'not-running' (default), 'next-exit', or 'removed'.

         */
         Docker.prototype.ContainerWait = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/wait';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                            /** set default value **/
                            queryParameters['condition'] = not-running;

                        if(parameters['condition'] !== undefined){
                            queryParameters['condition'] = parameters['condition'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Remove a container
         * @method
         * @name Docker#ContainerDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {boolean} parameters.v - Remove anonymous volumes associated with the container.
             * @param {boolean} parameters.force - If the container is running, kill it before removing it.
             * @param {boolean} parameters.link - Remove the specified link associated with the container.
         */
         Docker.prototype.ContainerDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['v'] !== undefined){
                            queryParameters['v'] = parameters['v'];
                        }
                
                
                


         

                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         

                        if(parameters['link'] !== undefined){
                            queryParameters['link'] = parameters['link'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * A response header `X-Docker-Container-Path-Stat` is returned, containing
a base64 - encoded JSON object with some filesystem header information
about the path.

         * @method
         * @name Docker#ContainerArchiveInfo
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.path - Resource in the container’s filesystem to archive.
         */
         Docker.prototype.ContainerArchiveInfo = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/archive';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['path'] !== undefined){
                            queryParameters['path'] = parameters['path'];
                        }
                
                
                


                if(parameters['path'] === undefined)
                    throw new Error('Missing required  parameter: path');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('HEAD', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get a tar archive of a resource in the filesystem of container id.
         * @method
         * @name Docker#ContainerArchive
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.path - Resource in the container’s filesystem to archive.
         */
         Docker.prototype.ContainerArchive = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/archive';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/x-tar'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['path'] !== undefined){
                            queryParameters['path'] = parameters['path'];
                        }
                
                
                


                if(parameters['path'] === undefined)
                    throw new Error('Missing required  parameter: path');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Upload a tar archive to be extracted to a path in the filesystem of container id.
         * @method
         * @name Docker#PutContainerArchive
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the container
             * @param {string} parameters.path - Path to a directory in the container to extract the archive’s contents into. 
             * @param {string} parameters.noOverwriteDirNonDir - If `1`, `true`, or `True` then it will be an error if unpacking the
given content would cause an existing directory to be replaced with
a non-directory and vice versa.

             * @param {string} parameters.copyUidgid - If `1`, `true`, then it will copy UID/GID maps to the dest file or
dir

             * @param {} parameters.inputStream - The input stream must be a tar archive compressed with one of the
following algorithms: `identity` (no compression), `gzip`, `bzip2`,
or `xz`.

         */
         Docker.prototype.PutContainerArchive = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/archive';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/x-tar'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['path'] !== undefined){
                            queryParameters['path'] = parameters['path'];
                        }
                
                
                


                if(parameters['path'] === undefined)
                    throw new Error('Missing required  parameter: path');
         

                        if(parameters['noOverwriteDirNonDir'] !== undefined){
                            queryParameters['noOverwriteDirNonDir'] = parameters['noOverwriteDirNonDir'];
                        }
                
                
                


         

                        if(parameters['copyUidgid'] !== undefined){
                            queryParameters['copyUIDGID'] = parameters['copyUidgid'];
                        }
                
                
                


         
                
                
                
                    if(parameters['inputStream'] !== undefined){
                        body = parameters['inputStream'];
                    }


                if(parameters['inputStream'] === undefined)
                    throw new Error('Missing required  parameter: inputStream');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('PUT', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete stopped containers
         * @method
         * @name Docker#ContainerPrune
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - Filters to process on the prune list, encoded as JSON (a `map[string][]string`).

Available filters:
- `until=<timestamp>` Prune containers created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
- `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune containers with (or without, in case `label!=...` is used) the specified labels.

         */
         Docker.prototype.ContainerPrune = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/prune';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Returns a list of images on the server. Note that it uses a different, smaller representation of an image than inspecting a single image.
         * @method
         * @name Docker#ImageList
         * @param {object} parameters - method options and parameters
             * @param {boolean} parameters.all - Show all images. Only images from a final layer (no children) are shown by default.
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the images list.

Available filters:

- `before`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)
- `dangling=true`
- `label=key` or `label="key=value"` of an image label
- `reference`=(`<image-name>[:<tag>]`)
- `since`=(`<image-name>[:<tag>]`,  `<image id>` or `<image@digest>`)

             * @param {boolean} parameters.digests - Show digest information as a `RepoDigests` field on each image.
         */
         Docker.prototype.ImageList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['all'] !== undefined){
                            queryParameters['all'] = parameters['all'];
                        }
                
                
                


         

                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         

                        if(parameters['digests'] !== undefined){
                            queryParameters['digests'] = parameters['digests'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Build an image from a tar archive with a `Dockerfile` in it.

The `Dockerfile` specifies how the image is built from the tar archive. It is typically in the archive's root, but can be at a different path or have a different name by specifying the `dockerfile` parameter. [See the `Dockerfile` reference for more information](https://docs.docker.com/engine/reference/builder/).

The Docker daemon performs a preliminary validation of the `Dockerfile` before starting the build, and returns an error if the syntax is incorrect. After that, each instruction is run one-by-one until the ID of the new image is output.

The build is canceled if the client drops the connection by quitting or being killed.

         * @method
         * @name Docker#ImageBuild
         * @param {object} parameters - method options and parameters
             * @param {} parameters.inputStream - A tar archive compressed with one of the following algorithms: identity (no compression), gzip, bzip2, xz.
             * @param {string} parameters.dockerfile - Path within the build context to the `Dockerfile`. This is ignored if `remote` is specified and points to an external `Dockerfile`.
             * @param {string} parameters.t - A name and optional tag to apply to the image in the `name:tag` format. If you omit the tag the default `latest` value is assumed. You can provide several `t` parameters.
             * @param {string} parameters.extrahosts - Extra hosts to add to /etc/hosts
             * @param {string} parameters.remote - A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are placed into a file called `Dockerfile` and the image is built from that file. If the URI points to a tarball, the file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points to a tarball and the `dockerfile` parameter is also specified, there must be a file with the corresponding path inside the tarball.
             * @param {boolean} parameters.q - Suppress verbose build output.
             * @param {boolean} parameters.nocache - Do not use the cache when building the image.
             * @param {string} parameters.cachefrom - JSON array of images used for build cache resolution.
             * @param {string} parameters.pull - Attempt to pull the image even if an older image exists locally.
             * @param {boolean} parameters.rm - Remove intermediate containers after a successful build.
             * @param {boolean} parameters.forcerm - Always remove intermediate containers, even upon failure.
             * @param {integer} parameters.memory - Set memory limit for build.
             * @param {integer} parameters.memswap - Total memory (memory + swap). Set as `-1` to disable swap.
             * @param {integer} parameters.cpushares - CPU shares (relative weight).
             * @param {string} parameters.cpusetcpus - CPUs in which to allow execution (e.g., `0-3`, `0,1`).
             * @param {integer} parameters.cpuperiod - The length of a CPU period in microseconds.
             * @param {integer} parameters.cpuquota - Microseconds of CPU time that the container can get in a CPU period.
             * @param {string} parameters.buildargs - JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable expansion in other `Dockerfile` instructions. This is not meant for passing secret values.

For example, the build arg `FOO=bar` would become `{"FOO":"bar"}` in JSON. This would result in the query parameter `buildargs={"FOO":"bar"}`. Note that `{"FOO":"bar"}` should be URI component encoded.

[Read more about the buildargs instruction.](https://docs.docker.com/engine/reference/builder/#arg)

             * @param {integer} parameters.shmsize - Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB.
             * @param {boolean} parameters.squash - Squash the resulting images layers into a single layer. *(Experimental release only.)*
             * @param {string} parameters.labels - Arbitrary key/value labels to set on the image, as a JSON map of string pairs.
             * @param {string} parameters.networkmode - Sets the networking mode for the run commands during build. Supported
standard values are: `bridge`, `host`, `none`, and `container:<name|id>`.
Any other value is taken as a custom network's name or ID to which this
container should connect to.

            
             * @param {string} parameters.xRegistryConfig - This is a base64-encoded JSON object with auth configurations for multiple registries that a build may refer to.

The key is a registry URL, and the value is an auth configuration object, [as described in the authentication section](#section/Authentication). For example:

```
{
  "docker.example.com": {
    "username": "janedoe",
    "password": "hunter2"
  },
  "https://index.docker.io/v1/": {
    "username": "mobydock",
    "password": "conta1n3rize14"
  }
}
```

Only the registry domain name (and port if not the default 443) are required. However, for legacy reasons, the Docker Hub registry must be specified with both a `https://` prefix and a `/v1/` suffix even though Docker will prefer to use the v2 registry API.

             * @param {string} parameters.platform - Platform in the format os[/arch[/variant]]
             * @param {string} parameters.target - Target build stage
             * @param {string} parameters.outputs - BuildKit output configuration
         */
         Docker.prototype.ImageBuild = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/build';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/octet-stream'];

                
                
                
                    if(parameters['inputStream'] !== undefined){
                        body = parameters['inputStream'];
                    }


         
                            /** set default value **/
                            queryParameters['dockerfile'] = Dockerfile;

                        if(parameters['dockerfile'] !== undefined){
                            queryParameters['dockerfile'] = parameters['dockerfile'];
                        }
                
                
                


         

                        if(parameters['t'] !== undefined){
                            queryParameters['t'] = parameters['t'];
                        }
                
                
                


         

                        if(parameters['extrahosts'] !== undefined){
                            queryParameters['extrahosts'] = parameters['extrahosts'];
                        }
                
                
                


         

                        if(parameters['remote'] !== undefined){
                            queryParameters['remote'] = parameters['remote'];
                        }
                
                
                


         

                        if(parameters['q'] !== undefined){
                            queryParameters['q'] = parameters['q'];
                        }
                
                
                


         

                        if(parameters['nocache'] !== undefined){
                            queryParameters['nocache'] = parameters['nocache'];
                        }
                
                
                


         

                        if(parameters['cachefrom'] !== undefined){
                            queryParameters['cachefrom'] = parameters['cachefrom'];
                        }
                
                
                


         

                        if(parameters['pull'] !== undefined){
                            queryParameters['pull'] = parameters['pull'];
                        }
                
                
                


         
                            /** set default value **/
                            queryParameters['rm'] = true;

                        if(parameters['rm'] !== undefined){
                            queryParameters['rm'] = parameters['rm'];
                        }
                
                
                


         

                        if(parameters['forcerm'] !== undefined){
                            queryParameters['forcerm'] = parameters['forcerm'];
                        }
                
                
                


         

                        if(parameters['memory'] !== undefined){
                            queryParameters['memory'] = parameters['memory'];
                        }
                
                
                


         

                        if(parameters['memswap'] !== undefined){
                            queryParameters['memswap'] = parameters['memswap'];
                        }
                
                
                


         

                        if(parameters['cpushares'] !== undefined){
                            queryParameters['cpushares'] = parameters['cpushares'];
                        }
                
                
                


         

                        if(parameters['cpusetcpus'] !== undefined){
                            queryParameters['cpusetcpus'] = parameters['cpusetcpus'];
                        }
                
                
                


         

                        if(parameters['cpuperiod'] !== undefined){
                            queryParameters['cpuperiod'] = parameters['cpuperiod'];
                        }
                
                
                


         

                        if(parameters['cpuquota'] !== undefined){
                            queryParameters['cpuquota'] = parameters['cpuquota'];
                        }
                
                
                


         

                        if(parameters['buildargs'] !== undefined){
                            queryParameters['buildargs'] = parameters['buildargs'];
                        }
                
                
                


         

                        if(parameters['shmsize'] !== undefined){
                            queryParameters['shmsize'] = parameters['shmsize'];
                        }
                
                
                


         

                        if(parameters['squash'] !== undefined){
                            queryParameters['squash'] = parameters['squash'];
                        }
                
                
                


         

                        if(parameters['labels'] !== undefined){
                            queryParameters['labels'] = parameters['labels'];
                        }
                
                
                


         

                        if(parameters['networkmode'] !== undefined){
                            queryParameters['networkmode'] = parameters['networkmode'];
                        }
                
                
                


         
                
                
                        headers['Content-type'] = 'application/x-tar';
                


         
                
                
                        if(parameters['xRegistryConfig'] !== undefined){
                            headers['X-Registry-Config'] = parameters['xRegistryConfig'];
                        }
                


         

                        if(parameters['platform'] !== undefined){
                            queryParameters['platform'] = parameters['platform'];
                        }
                
                
                


         

                        if(parameters['target'] !== undefined){
                            queryParameters['target'] = parameters['target'];
                        }
                
                
                


         

                        if(parameters['outputs'] !== undefined){
                            queryParameters['outputs'] = parameters['outputs'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete builder cache
         * @method
         * @name Docker#BuildPrune
         * @param {object} parameters - method options and parameters
             * @param {integer} parameters.keepStorage - Amount of disk space in bytes to keep for cache
             * @param {boolean} parameters.all - Remove all types of build cache
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the list of build cache objects.

Available filters:

- `until=<duration>`: duration relative to daemon's time, during which build cache was not used, in Go's duration format (e.g., '24h')
- `id=<id>`
- `parent=<id>`
- `type=<string>`
- `description=<string>`
- `inuse`
- `shared`
- `private`

         */
         Docker.prototype.BuildPrune = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/build/prune';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['keepStorage'] !== undefined){
                            queryParameters['keep-storage'] = parameters['keepStorage'];
                        }
                
                
                


         

                        if(parameters['all'] !== undefined){
                            queryParameters['all'] = parameters['all'];
                        }
                
                
                


         

                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create an image by either pulling it from a registry or importing it.
         * @method
         * @name Docker#ImageCreate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.fromImage - Name of the image to pull. The name may include a tag or digest. This parameter may only be used when pulling an image. The pull is cancelled if the HTTP connection is closed.
             * @param {string} parameters.fromSrc - Source to import. The value may be a URL from which the image can be retrieved or `-` to read the image from the request body. This parameter may only be used when importing an image.
             * @param {string} parameters.repo - Repository name given to an image when it is imported. The repo may include a tag. This parameter may only be used when importing an image.
             * @param {string} parameters.tag - Tag or digest. If empty when pulling an image, this causes all tags for the given image to be pulled.
             * @param {string} parameters.message - Set commit message for imported image.
             * @param {} parameters.inputImage - Image content if the value `-` has been specified in fromSrc query parameter
             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration.

Refer to the [authentication section](#section/Authentication) for
details.

             * @param {string} parameters.platform - Platform in the format os[/arch[/variant]]
         */
         Docker.prototype.ImageCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['text/plain'];


                        if(parameters['fromImage'] !== undefined){
                            queryParameters['fromImage'] = parameters['fromImage'];
                        }
                
                
                


         

                        if(parameters['fromSrc'] !== undefined){
                            queryParameters['fromSrc'] = parameters['fromSrc'];
                        }
                
                
                


         

                        if(parameters['repo'] !== undefined){
                            queryParameters['repo'] = parameters['repo'];
                        }
                
                
                


         

                        if(parameters['tag'] !== undefined){
                            queryParameters['tag'] = parameters['tag'];
                        }
                
                
                


         

                        if(parameters['message'] !== undefined){
                            queryParameters['message'] = parameters['message'];
                        }
                
                
                


         
                
                
                
                    if(parameters['inputImage'] !== undefined){
                        body = parameters['inputImage'];
                    }


         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


         

                        if(parameters['platform'] !== undefined){
                            queryParameters['platform'] = parameters['platform'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Return low-level information about an image.
         * @method
         * @name Docker#ImageInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or id
         */
         Docker.prototype.ImageInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Return parent layers of an image.
         * @method
         * @name Docker#ImageHistory
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or ID
         */
         Docker.prototype.ImageHistory = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}/history';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Push an image to a registry.

If you wish to push an image on to a private registry, that image must
already have a tag which references the registry. For example,
`registry.example.com/myimage:latest`.

The push is cancelled if the HTTP connection is closed.

         * @method
         * @name Docker#ImagePush
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or ID.
             * @param {string} parameters.tag - The tag to associate with the image on the registry.
             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration.

Refer to the [authentication section](#section/Authentication) for
details.

         */
         Docker.prototype.ImagePush = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}/push';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/octet-stream'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['tag'] !== undefined){
                            queryParameters['tag'] = parameters['tag'];
                        }
                
                
                


         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


                if(parameters['xRegistryAuth'] === undefined)
                    throw new Error('Missing required  parameter: xRegistryAuth');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Tag an image so that it becomes part of a repository.
         * @method
         * @name Docker#ImageTag
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or ID to tag.
             * @param {string} parameters.repo - The repository to tag in. For example, `someuser/someimage`.
             * @param {string} parameters.tag - The name of the new tag.
         */
         Docker.prototype.ImageTag = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}/tag';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['repo'] !== undefined){
                            queryParameters['repo'] = parameters['repo'];
                        }
                
                
                


         

                        if(parameters['tag'] !== undefined){
                            queryParameters['tag'] = parameters['tag'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Remove an image, along with any untagged parent images that were
referenced by that image.

Images can't be removed if they have descendant images, are being
used by a running container or are being used by a build.

         * @method
         * @name Docker#ImageDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or ID
             * @param {boolean} parameters.force - Remove the image even if it is being used by stopped containers or has other tags
             * @param {boolean} parameters.noprune - Do not delete untagged parent images
         */
         Docker.prototype.ImageDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         

                        if(parameters['noprune'] !== undefined){
                            queryParameters['noprune'] = parameters['noprune'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Search for an image on Docker Hub.
         * @method
         * @name Docker#ImageSearch
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.term - Term to search
             * @param {integer} parameters.limit - Maximum number of results to return
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to process on the images list. Available filters:

- `is-automated=(true|false)`
- `is-official=(true|false)`
- `stars=<number>` Matches images that has at least 'number' stars.

         */
         Docker.prototype.ImageSearch = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/search';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['term'] !== undefined){
                            queryParameters['term'] = parameters['term'];
                        }
                
                
                


                if(parameters['term'] === undefined)
                    throw new Error('Missing required  parameter: term');
         

                        if(parameters['limit'] !== undefined){
                            queryParameters['limit'] = parameters['limit'];
                        }
                
                
                


         

                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete unused images
         * @method
         * @name Docker#ImagePrune
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - Filters to process on the prune list, encoded as JSON (a `map[string][]string`). Available filters:

- `dangling=<boolean>` When set to `true` (or `1`), prune only
   unused *and* untagged images. When set to `false`
   (or `0`), all unused images are pruned.
- `until=<string>` Prune images created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
- `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune images with (or without, in case `label!=...` is used) the specified labels.

         */
         Docker.prototype.ImagePrune = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/prune';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Validate credentials for a registry and, if available, get an identity
token for accessing the registry without password.

         * @method
         * @name Docker#SystemAuth
         * @param {object} parameters - method options and parameters
             * @param {} parameters.authConfig - Authentication to check
         */
         Docker.prototype.SystemAuth = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/auth';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['authConfig'] !== undefined){
                        body = parameters['authConfig'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get system information
         * @method
         * @name Docker#SystemInfo
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SystemInfo = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/info';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Returns the version of Docker that is running and various information about the system that Docker is running on.
         * @method
         * @name Docker#SystemVersion
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SystemVersion = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/version';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * This is a dummy endpoint you can use to test if the server is accessible.
         * @method
         * @name Docker#SystemPing
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SystemPing = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/_ping';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['text/plain'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * This is a dummy endpoint you can use to test if the server is accessible.
         * @method
         * @name Docker#SystemPingHead
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SystemPingHead = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/_ping';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['text/plain'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('HEAD', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a new image from a container
         * @method
         * @name Docker#ImageCommit
         * @param {object} parameters - method options and parameters
             * @param {} parameters.containerConfig - The container configuration
             * @param {string} parameters.container - The ID or name of the container to commit
             * @param {string} parameters.repo - Repository name for the created image
             * @param {string} parameters.tag - Tag name for the create image
             * @param {string} parameters.comment - Commit message
             * @param {string} parameters.author - Author of the image (e.g., `John Hannibal Smith <hannibal@a-team.com>`)
             * @param {boolean} parameters.pause - Whether to pause the container before committing
             * @param {string} parameters.changes - `Dockerfile` instructions to apply while committing
         */
         Docker.prototype.ImageCommit = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/commit';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['containerConfig'] !== undefined){
                        body = parameters['containerConfig'];
                    }


         

                        if(parameters['container'] !== undefined){
                            queryParameters['container'] = parameters['container'];
                        }
                
                
                


         

                        if(parameters['repo'] !== undefined){
                            queryParameters['repo'] = parameters['repo'];
                        }
                
                
                


         

                        if(parameters['tag'] !== undefined){
                            queryParameters['tag'] = parameters['tag'];
                        }
                
                
                


         

                        if(parameters['comment'] !== undefined){
                            queryParameters['comment'] = parameters['comment'];
                        }
                
                
                


         

                        if(parameters['author'] !== undefined){
                            queryParameters['author'] = parameters['author'];
                        }
                
                
                


         
                            /** set default value **/
                            queryParameters['pause'] = true;

                        if(parameters['pause'] !== undefined){
                            queryParameters['pause'] = parameters['pause'];
                        }
                
                
                


         

                        if(parameters['changes'] !== undefined){
                            queryParameters['changes'] = parameters['changes'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Stream real-time events from the server.

Various objects within Docker report events when something happens to them.

Containers report these events: `attach`, `commit`, `copy`, `create`, `destroy`, `detach`, `die`, `exec_create`, `exec_detach`, `exec_start`, `exec_die`, `export`, `health_status`, `kill`, `oom`, `pause`, `rename`, `resize`, `restart`, `start`, `stop`, `top`, `unpause`, `update`, and `prune`

Images report these events: `delete`, `import`, `load`, `pull`, `push`, `save`, `tag`, `untag`, and `prune`

Volumes report these events: `create`, `mount`, `unmount`, `destroy`, and `prune`

Networks report these events: `create`, `connect`, `disconnect`, `destroy`, `update`, `remove`, and `prune`

The Docker daemon reports these events: `reload`

Services report these events: `create`, `update`, and `remove`

Nodes report these events: `create`, `update`, and `remove`

Secrets report these events: `create`, `update`, and `remove`

Configs report these events: `create`, `update`, and `remove`

The Builder reports `prune` events

         * @method
         * @name Docker#SystemEvents
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.since - Show events created since this timestamp then stream new events.
             * @param {string} parameters.until - Show events created until this timestamp then stop streaming.
             * @param {string} parameters.filters - A JSON encoded value of filters (a `map[string][]string`) to process on the event list. Available filters:

- `config=<string>` config name or ID
- `container=<string>` container name or ID
- `daemon=<string>` daemon name or ID
- `event=<string>` event type
- `image=<string>` image name or ID
- `label=<string>` image or container label
- `network=<string>` network name or ID
- `node=<string>` node ID
- `plugin`=<string> plugin name or ID
- `scope`=<string> local or swarm
- `secret=<string>` secret name or ID
- `service=<string>` service name or ID
- `type=<string>` object to filter by, one of `container`, `image`, `volume`, `network`, `daemon`, `plugin`, `node`, `service`, `secret` or `config`
- `volume=<string>` volume name

         */
         Docker.prototype.SystemEvents = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/events';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['since'] !== undefined){
                            queryParameters['since'] = parameters['since'];
                        }
                
                
                


         

                        if(parameters['until'] !== undefined){
                            queryParameters['until'] = parameters['until'];
                        }
                
                
                


         

                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get data usage information
         * @method
         * @name Docker#SystemDataUsage
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SystemDataUsage = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/system/df';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get a tarball containing all images and metadata for a repository.

If `name` is a specific name and tag (e.g. `ubuntu:latest`), then only that image (and its parents) are returned. If `name` is an image ID, similarly only that image (and its parents) are returned, but with the exclusion of the `repositories` file in the tarball, as there were no image names referenced.

### Image tarball format

An image tarball contains one directory per image layer (named using its long ID), each containing these files:

- `VERSION`: currently `1.0` - the file format version
- `json`: detailed layer information, similar to `docker inspect layer_id`
- `layer.tar`: A tarfile containing the filesystem changes in this layer

The `layer.tar` file contains `aufs` style `.wh..wh.aufs` files and directories for storing attribute changes and deletions.

If the tarball defines a repository, the tarball should also include a `repositories` file at the root that contains a list of repository and tag names mapped to layer IDs.

```json
{
  "hello-world": {
    "latest": "565a9d68a73f6706862bfe8409a7f659776d4d60a8d096eb4a3cbce6999cc2a1"
  }
}
```

         * @method
         * @name Docker#ImageGet
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or ID
         */
         Docker.prototype.ImageGet = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/{name}/get';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/x-tar'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get a tarball containing all images and metadata for several image
repositories.

For each value of the `names` parameter: if it is a specific name and
tag (e.g. `ubuntu:latest`), then only that image (and its parents) are
returned; if it is an image ID, similarly only that image (and its parents)
are returned and there would be no names referenced in the 'repositories'
file for this image ID.

For details on the format, see the [export image endpoint](#operation/ImageGet).

         * @method
         * @name Docker#ImageGetAll
         * @param {object} parameters - method options and parameters
             * @param {array} parameters.names - Image names to filter by
         */
         Docker.prototype.ImageGetAll = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/get';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/x-tar'];
                headers['content-type'] = ['application/json'];


                        if(parameters['names'] !== undefined){
                            queryParameters['names'] = parameters['names'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Load a set of images and tags into a repository.

For details on the format, see the [export image endpoint](#operation/ImageGet).

         * @method
         * @name Docker#ImageLoad
         * @param {object} parameters - method options and parameters
             * @param {} parameters.imagesTarball - Tar archive containing images
             * @param {boolean} parameters.quiet - Suppress progress details during load.
         */
         Docker.prototype.ImageLoad = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/images/load';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/x-tar'];

                
                
                
                    if(parameters['imagesTarball'] !== undefined){
                        body = parameters['imagesTarball'];
                    }


         

                        if(parameters['quiet'] !== undefined){
                            queryParameters['quiet'] = parameters['quiet'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Run a command inside a running container.
         * @method
         * @name Docker#ContainerExec
         * @param {object} parameters - method options and parameters
             * @param {} parameters.execConfig - Exec configuration
             * @param {string} parameters.id - ID or name of container
         */
         Docker.prototype.ContainerExec = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/containers/{id}/exec';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['execConfig'] !== undefined){
                        body = parameters['execConfig'];
                    }


                if(parameters['execConfig'] === undefined)
                    throw new Error('Missing required  parameter: execConfig');
         
                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Starts a previously set up exec instance. If detach is true, this endpoint
returns immediately after starting the command. Otherwise, it sets up an
interactive session with the command.

         * @method
         * @name Docker#ExecStart
         * @param {object} parameters - method options and parameters
             * @param {} parameters.execStartConfig - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

             * @param {string} parameters.id - Exec instance ID
         */
         Docker.prototype.ExecStart = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/exec/{id}/start';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/vnd.docker.raw-stream'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['execStartConfig'] !== undefined){
                        body = parameters['execStartConfig'];
                    }


         
                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Resize the TTY session used by an exec instance. This endpoint only works
if `tty` was specified as part of creating and starting the exec instance.

         * @method
         * @name Docker#ExecResize
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Exec instance ID
             * @param {integer} parameters.h - Height of the TTY session in characters
             * @param {integer} parameters.w - Width of the TTY session in characters
         */
         Docker.prototype.ExecResize = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/exec/{id}/resize';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['h'] !== undefined){
                            queryParameters['h'] = parameters['h'];
                        }
                
                
                


         

                        if(parameters['w'] !== undefined){
                            queryParameters['w'] = parameters['w'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Return low-level information about an exec instance.
         * @method
         * @name Docker#ExecInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Exec instance ID
         */
         Docker.prototype.ExecInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/exec/{id}/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List volumes
         * @method
         * @name Docker#VolumeList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - JSON encoded value of the filters (a `map[string][]string`) to
process on the volumes list. Available filters:

- `dangling=<boolean>` When set to `true` (or `1`), returns all
   volumes that are not in use by a container. When set to `false`
   (or `0`), only volumes that are in use by one or more
   containers are returned.
- `driver=<volume-driver-name>` Matches volumes based on their driver.
- `label=<key>` or `label=<key>:<value>` Matches volumes based on
   the presence of a `label` alone or a `label` and a value.
- `name=<volume-name>` Matches all or part of a volume name.

         */
         Docker.prototype.VolumeList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/volumes';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a volume
         * @method
         * @name Docker#VolumeCreate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.volumeConfig - Volume configuration
         */
         Docker.prototype.VolumeCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/volumes/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['volumeConfig'] !== undefined){
                        body = parameters['volumeConfig'];
                    }


                if(parameters['volumeConfig'] === undefined)
                    throw new Error('Missing required  parameter: volumeConfig');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a volume
         * @method
         * @name Docker#VolumeInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Volume name or ID
         */
         Docker.prototype.VolumeInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/volumes/{name}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Instruct the driver to remove the volume.
         * @method
         * @name Docker#VolumeDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Volume name or ID
             * @param {boolean} parameters.force - Force the removal of the volume
         */
         Docker.prototype.VolumeDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/volumes/{name}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete unused volumes
         * @method
         * @name Docker#VolumePrune
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - Filters to process on the prune list, encoded as JSON (a `map[string][]string`).

Available filters:
- `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune volumes with (or without, in case `label!=...` is used) the specified labels.

         */
         Docker.prototype.VolumePrune = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/volumes/prune';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Returns a list of networks. For details on the format, see the
[network inspect endpoint](#operation/NetworkInspect).

Note that it uses a different, smaller representation of a network than
inspecting a single network. For example, the list of containers attached
to the network is not propagated in API versions 1.28 and up.

         * @method
         * @name Docker#NetworkList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - JSON encoded value of the filters (a `map[string][]string`) to process
on the networks list.

Available filters:

- `dangling=<boolean>` When set to `true` (or `1`), returns all
   networks that are not in use by a container. When set to `false`
   (or `0`), only networks that are in use by one or more
   containers are returned.
- `driver=<driver-name>` Matches a network's driver.
- `id=<network-id>` Matches all or part of a network ID.
- `label=<key>` or `label=<key>=<value>` of a network label.
- `name=<network-name>` Matches all or part of a network name.
- `scope=["swarm"|"global"|"local"]` Filters networks by scope (`swarm`, `global`, or `local`).
- `type=["custom"|"builtin"]` Filters networks by type. The `custom` keyword returns all user-defined networks.

         */
         Docker.prototype.NetworkList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a network
         * @method
         * @name Docker#NetworkInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Network ID or name
             * @param {boolean} parameters.verbose - Detailed inspect output for troubleshooting
             * @param {string} parameters.scope - Filter the network by scope (swarm, global, or local)
         */
         Docker.prototype.NetworkInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['verbose'] !== undefined){
                            queryParameters['verbose'] = parameters['verbose'];
                        }
                
                
                


         

                        if(parameters['scope'] !== undefined){
                            queryParameters['scope'] = parameters['scope'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Remove a network
         * @method
         * @name Docker#NetworkDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Network ID or name
         */
         Docker.prototype.NetworkDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a network
         * @method
         * @name Docker#NetworkCreate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.networkConfig - Network configuration
         */
         Docker.prototype.NetworkCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['networkConfig'] !== undefined){
                        body = parameters['networkConfig'];
                    }


                if(parameters['networkConfig'] === undefined)
                    throw new Error('Missing required  parameter: networkConfig');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Connect a container to a network
         * @method
         * @name Docker#NetworkConnect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Network ID or name
             * @param {} parameters.container - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.NetworkConnect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/{id}/connect';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['container'] !== undefined){
                        body = parameters['container'];
                    }


                if(parameters['container'] === undefined)
                    throw new Error('Missing required  parameter: container');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Disconnect a container from a network
         * @method
         * @name Docker#NetworkDisconnect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - Network ID or name
             * @param {} parameters.container - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.NetworkDisconnect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/{id}/disconnect';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['container'] !== undefined){
                        body = parameters['container'];
                    }


                if(parameters['container'] === undefined)
                    throw new Error('Missing required  parameter: container');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete unused networks
         * @method
         * @name Docker#NetworkPrune
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - Filters to process on the prune list, encoded as JSON (a `map[string][]string`).

Available filters:
- `until=<timestamp>` Prune networks created before this timestamp. The `<timestamp>` can be Unix timestamps, date formatted timestamps, or Go duration strings (e.g. `10m`, `1h30m`) computed relative to the daemon machine’s time.
- `label` (`label=<key>`, `label=<key>=<value>`, `label!=<key>`, or `label!=<key>=<value>`) Prune networks with (or without, in case `label!=...` is used) the specified labels.

         */
         Docker.prototype.NetworkPrune = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/networks/prune';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Returns information about installed plugins.
         * @method
         * @name Docker#PluginList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the plugin list.

Available filters:

- `capability=<capability name>`
- `enable=<true>|<false>`

         */
         Docker.prototype.PluginList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get plugin privileges
         * @method
         * @name Docker#GetPluginPrivileges
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.remote - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

         */
         Docker.prototype.GetPluginPrivileges = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/privileges';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];


                        if(parameters['remote'] !== undefined){
                            queryParameters['remote'] = parameters['remote'];
                        }
                
                
                


                if(parameters['remote'] === undefined)
                    throw new Error('Missing required  parameter: remote');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Pulls and installs a plugin. After the plugin is installed, it can be
enabled using the [`POST /plugins/{name}/enable` endpoint](#operation/PostPluginsEnable).

         * @method
         * @name Docker#PluginPull
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.remote - Remote reference for plugin to install.

The `:latest` tag is optional, and is used as the default if omitted.

             * @param {string} parameters.name - Local name for the pulled plugin.

The `:latest` tag is optional, and is used as the default if omitted.

             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration to use when pulling a plugin
from a registry.

Refer to the [authentication section](#section/Authentication) for
details.

             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.PluginPull = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/pull';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['remote'] !== undefined){
                            queryParameters['remote'] = parameters['remote'];
                        }
                
                
                


                if(parameters['remote'] === undefined)
                    throw new Error('Missing required  parameter: remote');
         

                        if(parameters['name'] !== undefined){
                            queryParameters['name'] = parameters['name'];
                        }
                
                
                


         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a plugin
         * @method
         * @name Docker#PluginInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

         */
         Docker.prototype.PluginInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Remove a plugin
         * @method
         * @name Docker#PluginDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

             * @param {boolean} parameters.force - Disable the plugin before removing. This may result in issues if the
plugin is in use by a container.

         */
         Docker.prototype.PluginDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Enable a plugin
         * @method
         * @name Docker#PluginEnable
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

             * @param {integer} parameters.timeout - Set the HTTP client timeout (in seconds)
         */
         Docker.prototype.PluginEnable = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/enable';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['timeout'] !== undefined){
                            queryParameters['timeout'] = parameters['timeout'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Disable a plugin
         * @method
         * @name Docker#PluginDisable
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

         */
         Docker.prototype.PluginDisable = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/disable';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Upgrade a plugin
         * @method
         * @name Docker#PluginUpgrade
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

             * @param {string} parameters.remote - Remote reference to upgrade to.

The `:latest` tag is optional, and is used as the default if omitted.

             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration to use when pulling a plugin
from a registry.

Refer to the [authentication section](#section/Authentication) for
details.

             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.PluginUpgrade = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/upgrade';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         

                        if(parameters['remote'] !== undefined){
                            queryParameters['remote'] = parameters['remote'];
                        }
                
                
                


                if(parameters['remote'] === undefined)
                    throw new Error('Missing required  parameter: remote');
         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a plugin
         * @method
         * @name Docker#PluginCreate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

             * @param {} parameters.tarContext - Path to tar containing plugin rootfs and manifest
         */
         Docker.prototype.PluginCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/x-tar'];


                        if(parameters['name'] !== undefined){
                            queryParameters['name'] = parameters['name'];
                        }
                
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
                
                
                
                    if(parameters['tarContext'] !== undefined){
                        body = parameters['tarContext'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Push a plugin to the registry.

         * @method
         * @name Docker#PluginPush
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

         */
         Docker.prototype.PluginPush = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/push';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Configure a plugin
         * @method
         * @name Docker#PluginSet
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - The name of the plugin. The `:latest` tag is optional, and is the
default if omitted.

             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.PluginSet = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/plugins/{name}/set';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List nodes
         * @method
         * @name Docker#NodeList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - Filters to process on the nodes list, encoded as JSON (a `map[string][]string`).

Available filters:
- `id=<node id>`
- `label=<engine label>`
- `membership=`(`accepted`|`pending`)`
- `name=<node name>`
- `node.label=<node label>`
- `role=`(`manager`|`worker`)`

         */
         Docker.prototype.NodeList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/nodes';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a node
         * @method
         * @name Docker#NodeInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - The ID or name of the node
         */
         Docker.prototype.NodeInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/nodes/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete a node
         * @method
         * @name Docker#NodeDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - The ID or name of the node
             * @param {boolean} parameters.force - Force remove a node from the swarm
         */
         Docker.prototype.NodeDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/nodes/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Update a node
         * @method
         * @name Docker#NodeUpdate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - The ID of the node
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

             * @param {integer} parameters.version - The version number of the node object being updated. This is required
to avoid conflicting writes.

         */
         Docker.prototype.NodeUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/nodes/{id}/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         

                        if(parameters['version'] !== undefined){
                            queryParameters['version'] = parameters['version'];
                        }
                
                
                


                if(parameters['version'] === undefined)
                    throw new Error('Missing required  parameter: version');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect swarm
         * @method
         * @name Docker#SwarmInspect
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SwarmInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Initialize a new swarm
         * @method
         * @name Docker#SwarmInit
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.SwarmInit = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/init';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Join an existing swarm
         * @method
         * @name Docker#SwarmJoin
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.SwarmJoin = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/join';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Leave a swarm
         * @method
         * @name Docker#SwarmLeave
         * @param {object} parameters - method options and parameters
             * @param {boolean} parameters.force - Force leave swarm, even if this is the last manager or that it will
break the cluster.

         */
         Docker.prototype.SwarmLeave = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/leave';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];


                        if(parameters['force'] !== undefined){
                            queryParameters['force'] = parameters['force'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Update a swarm
         * @method
         * @name Docker#SwarmUpdate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

             * @param {integer} parameters.version - The version number of the swarm object being updated. This is
required to avoid conflicting writes.

             * @param {boolean} parameters.rotateWorkerToken - Rotate the worker join token.
             * @param {boolean} parameters.rotateManagerToken - Rotate the manager join token.
             * @param {boolean} parameters.rotateManagerUnlockKey - Rotate the manager unlock key.
         */
         Docker.prototype.SwarmUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         

                        if(parameters['version'] !== undefined){
                            queryParameters['version'] = parameters['version'];
                        }
                
                
                


                if(parameters['version'] === undefined)
                    throw new Error('Missing required  parameter: version');
         

                        if(parameters['rotateWorkerToken'] !== undefined){
                            queryParameters['rotateWorkerToken'] = parameters['rotateWorkerToken'];
                        }
                
                
                


         

                        if(parameters['rotateManagerToken'] !== undefined){
                            queryParameters['rotateManagerToken'] = parameters['rotateManagerToken'];
                        }
                
                
                


         

                        if(parameters['rotateManagerUnlockKey'] !== undefined){
                            queryParameters['rotateManagerUnlockKey'] = parameters['rotateManagerUnlockKey'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get the unlock key
         * @method
         * @name Docker#SwarmUnlockkey
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.SwarmUnlockkey = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/unlockkey';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Unlock a locked manager
         * @method
         * @name Docker#SwarmUnlock
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.SwarmUnlock = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/swarm/unlock';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List services
         * @method
         * @name Docker#ServiceList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the services list.

Available filters:

- `id=<service id>`
- `label=<service label>`
- `mode=["replicated"|"global"]`
- `name=<service name>`

             * @param {boolean} parameters.status - Include service status, with count of running and desired tasks.

         */
         Docker.prototype.ServiceList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         

                        if(parameters['status'] !== undefined){
                            queryParameters['status'] = parameters['status'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a service
         * @method
         * @name Docker#ServiceCreate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration for pulling from private
registries.

Refer to the [authentication section](#section/Authentication) for
details.

         */
         Docker.prototype.ServiceCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a service
         * @method
         * @name Docker#ServiceInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of service.
             * @param {boolean} parameters.insertDefaults - Fill empty fields with default values.
         */
         Docker.prototype.ServiceInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['insertDefaults'] !== undefined){
                            queryParameters['insertDefaults'] = parameters['insertDefaults'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete a service
         * @method
         * @name Docker#ServiceDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of service.
         */
         Docker.prototype.ServiceDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Update a service
         * @method
         * @name Docker#ServiceUpdate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of service.
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

             * @param {integer} parameters.version - The version number of the service object being updated. This is
required to avoid conflicting writes.
This version number should be the value as currently set on the
service *before* the update. You can find the current version by
calling `GET /services/{id}`

             * @param {string} parameters.registryAuthFrom - If the `X-Registry-Auth` header is not specified, this parameter
indicates where to find registry authorization credentials.

             * @param {string} parameters.rollback - Set to this parameter to `previous` to cause a server-side rollback
to the previous service spec. The supplied spec will be ignored in
this case.

             * @param {string} parameters.xRegistryAuth - A base64url-encoded auth configuration for pulling from private
registries.

Refer to the [authentication section](#section/Authentication) for
details.

         */
         Docker.prototype.ServiceUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services/{id}/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


                if(parameters['body'] === undefined)
                    throw new Error('Missing required  parameter: body');
         

                        if(parameters['version'] !== undefined){
                            queryParameters['version'] = parameters['version'];
                        }
                
                
                


                if(parameters['version'] === undefined)
                    throw new Error('Missing required  parameter: version');
         
                            /** set default value **/
                            queryParameters['registryAuthFrom'] = spec;

                        if(parameters['registryAuthFrom'] !== undefined){
                            queryParameters['registryAuthFrom'] = parameters['registryAuthFrom'];
                        }
                
                
                


         

                        if(parameters['rollback'] !== undefined){
                            queryParameters['rollback'] = parameters['rollback'];
                        }
                
                
                


         
                
                
                        if(parameters['xRegistryAuth'] !== undefined){
                            headers['X-Registry-Auth'] = parameters['xRegistryAuth'];
                        }
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get `stdout` and `stderr` logs from a service. See also
[`/containers/{id}/logs`](#operation/ContainerLogs).

**Note**: This endpoint works only for services with the `local`,
`json-file` or `journald` logging drivers.

         * @method
         * @name Docker#ServiceLogs
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID or name of the service
             * @param {boolean} parameters.details - Show service context and extra details provided to logs.
             * @param {boolean} parameters.follow - Keep connection after returning logs.
             * @param {boolean} parameters.stdout - Return logs from `stdout`
             * @param {boolean} parameters.stderr - Return logs from `stderr`
             * @param {integer} parameters.since - Only return logs since this time, as a UNIX timestamp
             * @param {boolean} parameters.timestamps - Add timestamps to every log line
             * @param {string} parameters.tail - Only return this number of log lines from the end of the logs.
Specify as an integer or `all` to output all log lines.

         */
         Docker.prototype.ServiceLogs = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/services/{id}/logs';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['details'] !== undefined){
                            queryParameters['details'] = parameters['details'];
                        }
                
                
                


         

                        if(parameters['follow'] !== undefined){
                            queryParameters['follow'] = parameters['follow'];
                        }
                
                
                


         

                        if(parameters['stdout'] !== undefined){
                            queryParameters['stdout'] = parameters['stdout'];
                        }
                
                
                


         

                        if(parameters['stderr'] !== undefined){
                            queryParameters['stderr'] = parameters['stderr'];
                        }
                
                
                


         

                        if(parameters['since'] !== undefined){
                            queryParameters['since'] = parameters['since'];
                        }
                
                
                


         

                        if(parameters['timestamps'] !== undefined){
                            queryParameters['timestamps'] = parameters['timestamps'];
                        }
                
                
                


         
                            /** set default value **/
                            queryParameters['tail'] = all;

                        if(parameters['tail'] !== undefined){
                            queryParameters['tail'] = parameters['tail'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List tasks
         * @method
         * @name Docker#TaskList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the tasks list.

Available filters:

- `desired-state=(running | shutdown | accepted)`
- `id=<task id>`
- `label=key` or `label="key=value"`
- `name=<task name>`
- `node=<node id or name>`
- `service=<service name>`

         */
         Docker.prototype.TaskList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/tasks';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a task
         * @method
         * @name Docker#TaskInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the task
         */
         Docker.prototype.TaskInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/tasks/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Get `stdout` and `stderr` logs from a task.
See also [`/containers/{id}/logs`](#operation/ContainerLogs).

**Note**: This endpoint works only for services with the `local`,
`json-file` or `journald` logging drivers.

         * @method
         * @name Docker#TaskLogs
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the task
             * @param {boolean} parameters.details - Show task context and extra details provided to logs.
             * @param {boolean} parameters.follow - Keep connection after returning logs.
             * @param {boolean} parameters.stdout - Return logs from `stdout`
             * @param {boolean} parameters.stderr - Return logs from `stderr`
             * @param {integer} parameters.since - Only return logs since this time, as a UNIX timestamp
             * @param {boolean} parameters.timestamps - Add timestamps to every log line
             * @param {string} parameters.tail - Only return this number of log lines from the end of the logs.
Specify as an integer or `all` to output all log lines.

         */
         Docker.prototype.TaskLogs = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/tasks/{id}/logs';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         

                        if(parameters['details'] !== undefined){
                            queryParameters['details'] = parameters['details'];
                        }
                
                
                


         

                        if(parameters['follow'] !== undefined){
                            queryParameters['follow'] = parameters['follow'];
                        }
                
                
                


         

                        if(parameters['stdout'] !== undefined){
                            queryParameters['stdout'] = parameters['stdout'];
                        }
                
                
                


         

                        if(parameters['stderr'] !== undefined){
                            queryParameters['stderr'] = parameters['stderr'];
                        }
                
                
                


         

                        if(parameters['since'] !== undefined){
                            queryParameters['since'] = parameters['since'];
                        }
                
                
                


         

                        if(parameters['timestamps'] !== undefined){
                            queryParameters['timestamps'] = parameters['timestamps'];
                        }
                
                
                


         
                            /** set default value **/
                            queryParameters['tail'] = all;

                        if(parameters['tail'] !== undefined){
                            queryParameters['tail'] = parameters['tail'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List secrets
         * @method
         * @name Docker#SecretList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the secrets list.

Available filters:

- `id=<secret id>`
- `label=<key> or label=<key>=value`
- `name=<secret name>`
- `names=<secret name>`

         */
         Docker.prototype.SecretList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/secrets';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a secret
         * @method
         * @name Docker#SecretCreate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.SecretCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/secrets/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a secret
         * @method
         * @name Docker#SecretInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the secret
         */
         Docker.prototype.SecretInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/secrets/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete a secret
         * @method
         * @name Docker#SecretDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the secret
         */
         Docker.prototype.SecretDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/secrets/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Update a Secret
         * @method
         * @name Docker#SecretUpdate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - The ID or name of the secret
             * @param {} parameters.body - The spec of the secret to update. Currently, only the Labels field
can be updated. All other fields must remain unchanged from the
[SecretInspect endpoint](#operation/SecretInspect) response values.

             * @param {integer} parameters.version - The version number of the secret object being updated. This is
required to avoid conflicting writes.

         */
         Docker.prototype.SecretUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/secrets/{id}/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         

                        if(parameters['version'] !== undefined){
                            queryParameters['version'] = parameters['version'];
                        }
                
                
                


                if(parameters['version'] === undefined)
                    throw new Error('Missing required  parameter: version');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * List configs
         * @method
         * @name Docker#ConfigList
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.filters - A JSON encoded value of the filters (a `map[string][]string`) to
process on the configs list.

Available filters:

- `id=<config id>`
- `label=<key> or label=<key>=value`
- `name=<config name>`
- `names=<config name>`

         */
         Docker.prototype.ConfigList = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/configs';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];


                        if(parameters['filters'] !== undefined){
                            queryParameters['filters'] = parameters['filters'];
                        }
                
                
                


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Create a config
         * @method
         * @name Docker#ConfigCreate
         * @param {object} parameters - method options and parameters
             * @param {} parameters.body - The Engine API is an HTTP API served by Docker Engine. It is the API the
Docker client uses to communicate with the Engine, so everything the Docker
client can do can be done with the API.

Most of the client's commands map directly to API endpoints (e.g. `docker ps`
is `GET /containers/json`). The notable exception is running containers,
which consists of several API calls.

# Errors

The API uses standard HTTP status codes to indicate the success or failure
of the API call. The body of the response will be JSON in the following
format:

```
{
  "message": "page not found"
}
```

# Versioning

The API is usually changed in each release, so API calls are versioned to
ensure that clients don't break. To lock to a specific version of the API,
you prefix the URL with its version, for example, call `/v1.30/info` to use
the v1.30 version of the `/info` endpoint. If the API version specified in
the URL is not supported by the daemon, a HTTP `400 Bad Request` error message
is returned.

If you omit the version-prefix, the current version of the API (v1.41) is used.
For example, calling `/info` is the same as calling `/v1.41/info`. Using the
API without a version-prefix is deprecated and will be removed in a future release.

Engine releases in the near future should support this version of the API,
so your client will continue to work even if it is talking to a newer Engine.

The API uses an open schema model, which means server may add extra properties
to responses. Likewise, the server will ignore any extra query parameters and
request body properties. When you write clients, you need to ignore additional
properties in responses to ensure they do not break when talking to newer
daemons.


# Authentication

Authentication for registries is handled client side. The client has to send
authentication details to various endpoints that need to communicate with
registries, such as `POST /images/(name)/push`. These are sent as
`X-Registry-Auth` header as a [base64url encoded](https://tools.ietf.org/html/rfc4648#section-5)
(JSON) string with the following structure:

```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "serveraddress": "string"
}
```

The `serveraddress` is a domain/IP without a protocol. Throughout this
structure, double quotes are required.

If you have already got an identity token from the [`/auth` endpoint](#operation/SystemAuth),
you can just pass this instead of credentials:

```
{
  "identitytoken": "9cbaf023786cd7..."
}
```

         */
         Docker.prototype.ConfigCreate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/configs/create';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Inspect a config
         * @method
         * @name Docker#ConfigInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the config
         */
         Docker.prototype.ConfigInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/configs/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Delete a config
         * @method
         * @name Docker#ConfigDelete
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - ID of the config
         */
         Docker.prototype.ConfigDelete = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/configs/{id}';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('DELETE', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Update a Config
         * @method
         * @name Docker#ConfigUpdate
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.id - The ID or name of the config
             * @param {} parameters.body - The spec of the config to update. Currently, only the Labels field
can be updated. All other fields must remain unchanged from the
[ConfigInspect endpoint](#operation/ConfigInspect) response values.

             * @param {integer} parameters.version - The version number of the config object being updated. This is
required to avoid conflicting writes.

         */
         Docker.prototype.ConfigUpdate = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/configs/{id}/update';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json, text/plain'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{id}', parameters['id']);
                
                


                if(parameters['id'] === undefined)
                    throw new Error('Missing required  parameter: id');
         
                
                
                
                    if(parameters['body'] !== undefined){
                        body = parameters['body'];
                    }


         

                        if(parameters['version'] !== undefined){
                            queryParameters['version'] = parameters['version'];
                        }
                
                
                


                if(parameters['version'] === undefined)
                    throw new Error('Missing required  parameter: version');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Return image digest and platform information by contacting the registry.

         * @method
         * @name Docker#DistributionInspect
         * @param {object} parameters - method options and parameters
             * @param {string} parameters.name - Image name or id
         */
         Docker.prototype.DistributionInspect = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/distribution/{name}/json';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/json'];
                headers['content-type'] = ['application/json'];

                
                    path = path.replace('{name}', parameters['name']);
                
                


                if(parameters['name'] === undefined)
                    throw new Error('Missing required  parameter: name');
         
            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('GET', domain + path, parameters, body, headers, queryParameters, form);
         };
        /**
         * Start a new interactive session with a server. Session allows server to
call back to the client for advanced capabilities.

### Hijacking

This endpoint hijacks the HTTP connection to HTTP2 transport that allows
the client to expose gPRC services on that connection.

For example, the client sends this request to upgrade the connection:

```
POST /session HTTP/1.1
Upgrade: h2c
Connection: Upgrade
```

The Docker daemon responds with a `101 UPGRADED` response follow with
the raw stream:

```
HTTP/1.1 101 UPGRADED
Connection: Upgrade
Upgrade: h2c
```

         * @method
         * @name Docker#Session
         * @param {object} parameters - method options and parameters
         */
         Docker.prototype.Session = function(parameters){
            if(parameters === undefined) {
                parameters = {};
            }
            var domain = this.domain,  path = '/session';
            var body = {}, queryParameters = {}, form = {};
            var headers = util.clone(this.headers);

                headers['accept'] = ['application/vnd.docker.raw-stream'];
                headers['content-type'] = ['application/json'];

            queryParameters = mergeQueryParams(parameters, queryParameters);

            return request('POST', domain + path, parameters, body, headers, queryParameters, form);
         };

    return Docker;
})();

exports.Docker = Docker;
