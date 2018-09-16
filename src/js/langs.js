function loadLang(lang, cb) {
    var xmlhttp = new XMLHttpRequest();
    var url = "/locales/"+lang+".json";
    
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            proxy.strings = json
            cb()
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}