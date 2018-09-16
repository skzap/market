(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.proxy = new Proxy({},{
    get: function(obj, prop) {
        return get(obj, prop)
    },
    set: function(obj, prop, value) {
        return set(obj, prop, value)
    }
  })
  
function set(obj, prop, value) {
    obj[prop] = value;
    console.log(obj, prop, value)
    // for single values where we dont want to update the full template
    if (!obj._template && document.getElementById(prop)) {
        document.getElementById(prop).innerHTML = value
        return true;
    }
    for (let i = 0; i < templates.length; i++) {
        if (!obj || !obj._template) break;
        if (obj._template.startsWith(templates[i])) {
            if (!window[templates[i]]) return true;
            window[templates[i]].outerHTML = template(templates[i]+'.html', proxy)
            bind[templates[i]]()
        }
    }
    return true;
}
  
function get(obj, prop) {
    if (prop == 'toJSON') return
    if (!(prop in obj))
      obj[prop] = new Proxy({_template: prop},{
        get: function(obj, prop) {
          return get(obj, prop)
        },
        set: function(obj, prop, value) {
          return set(obj, prop, value)
        }
      })
  
    return obj[prop]
}

var bind = {
    listcategories: function() {
                
    }
}

bind.listcategories()

template.defaults.imports.percent = function(float) {
    return Math.round(10000*float)/100
}
var templates = ['navbar', 'listcategories']

// load english language strings and start the render
loadLang("en", function() {
    var html = ''
    for (let i = 0; i < templates.length; i++)
        html += template(templates[i]+'.html', proxy)
    document.getElementById('content').innerHTML = html

    // init the topbar
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
            const target = el.dataset.target;
            const $target = document.getElementById(target);
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    });
    }
})


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

},{}]},{},[1]);
