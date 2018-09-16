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
var templates = ['listcategories']

// load english language strings and start the render
loadLang("en", function() {
    var html = ''
    for (let i = 0; i < templates.length; i++)
        html += template(templates[i]+'.html', proxy)
    document.getElementById('content').innerHTML = html

    // init the topbar
    document.getElementById('navbar-container').innerHTML = template('navbar.html', proxy)
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
window.Router = {
    routes: [],
    mode: null,
    root: '/',
    config: function(options) {
        this.mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash';
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    },
    getFragment: function() {
        var fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    },
    clearSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    add: function(re, handler) {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    },
    remove: function(param) {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    },
    flush: function() {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    },
    check: function(f) {
        var fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            var match = fragment.match(this.routes[i].re);
            if(match) {
                match.shift();
                this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    },
    listen: function() {
        var self = this;
        var current = self.getFragment();
        var fn = function() {
            if(current !== self.getFragment()) {
                current = self.getFragment();
                self.check(current);
            }
        }
        clearInterval(this.interval);
        this.interval = setInterval(fn, 50);
        return this;
    },
    navigate: function(path) {
        console.log(path)
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
}

// configuration
Router.config({ mode: 'hash'});

// returning the user to the initial state
Router.navigate(Router.getFragment());

// adding routes
Router
.add(/about/, function() {
    console.log('about');
})
.add(/products\/(.*)\/edit\/(.*)/, function() {
    console.log('products', arguments);
})
.add(function() {
    console.log('default page (most likely 404)');
})

// forwarding
//Router.navigate('/about');
