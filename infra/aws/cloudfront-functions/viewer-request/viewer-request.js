function handler(event) {
    var request = event.request;

    // Redirect apex to www
    if (request.headers.host.value === 'brokenrobot.xyz') {
        var response = {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: {
                    value: `https://www.brokenrobot.xyz${request.uri}`
                }
            }
        };

        return response;
    }

    // Rewrite the URL
    if (request.uri.endsWith('/') === true) {
        request.uri += 'index.html';
    } else if (request.uri.includes('.') !== true) {
        request.uri += '/index.html';
    }

    return request;
}
