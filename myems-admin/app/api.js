//Switch Classes Function
function getAPI(){
    // return "http://127.0.0.1:8000/";
    // to avoid CORS issue, use Nginx to proxy myems-api to path /api with the same ip and port as myems-web
    return window.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/api/";
}
