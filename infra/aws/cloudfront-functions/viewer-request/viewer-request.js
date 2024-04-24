function handler(event) {
    var apexDomain = 'brokenrobot.xyz';
    var request = event.request;
    var headers = request.headers;

    // Redirect apex to www
    if (headers.host.value === apexDomain) {
        var response = {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: {
                    value: 'https://www.' + headers.host.value + '/' + request.uri
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
