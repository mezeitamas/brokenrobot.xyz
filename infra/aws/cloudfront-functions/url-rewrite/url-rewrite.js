function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.endsWith('/') === true) {
        request.uri += 'index.html';
    } else if (uri.includes('.') !== true) {
        request.uri += '/index.html';
    }

    return request;
}
