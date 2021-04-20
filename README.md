# Docker client for fibjs

## Installation

```bash
fibjs --install fib-docker
```

## Example Code

```JavaScript
var Docker = require('fib-docker').Docker;

var docker = new Docker({
    domain: "http://%2Fvar%2Frun%2Fdocker.sock/v1.39",
    headers: {
        host: "localhost"
    }
});

console.log(docker.SystemInfo());
```