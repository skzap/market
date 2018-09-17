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

window.steem = require('steem')
var bind = {
    listcategories: function() {
                
    },
    navbar: function() {
        var loginModal = navbar.getElementsByClassName('modal')[0]
        var closeModal = navbar.getElementsByClassName('modal-close')[0]
        var loginButton = navbar.getElementsByClassName('button login')[0]
        var loginConfirm = navbar.getElementsByClassName('button confirm')[0]
        var loginCancel = navbar.getElementsByClassName('button cancel')[0]

        if (!proxy.user)
            loginButton.onclick = () => loginModal.classList.add('is-active')
        closeModal.onclick = () => loginModal.classList.remove('is-active')
        loginCancel.onclick = () => loginModal.classList.remove('is-active')
        loginConfirm.onclick = () => login()

        function login() {
            var username = document.getElementById('inputLoginUser').value.trim().replace('@', '')
            var key = document.getElementById('inputLoginKey').value.trim()
            if (!username || !key) throw "Need username AND key"
            steem.api.getAccounts([username], function(err, result) {
                if (err) throw err;
                var chainuser = result[0]
                var user = {
                  privatekey: key
                }
                try {
                  user.publickey = steem.auth.wifToPublic(user.privatekey)
                } catch (e) {
                  throw "Wrong key"
                  return
                }

                if (chainuser.posting.key_auths[0][0] == user.publickey) {
                    user.username = username
                    user.balance = chainuser.balance
                    proxy.user = user
                    console.log('Logged in as '+proxy.user.username)
                    loginModal.classList.remove('is-active')
                    navbar.innerHTML = template('navbar.html', proxy)
                    bind.navbar()
                } else {
                    throw "Existing key but not matching username"
                }
            })
        }
    }
}

bind.listcategories()

window.config = {
    root_category: 'curator/root-category'
}
template.defaults.imports.percent = function(float) {
    return Math.round(10000*float)/100
}
var templates = ['listcategories']
var loadedLang = false
var loadedSteem = false

proxy.user = null

// load english language strings and start the render
loadSteem(function() {
    loadedSteem = true
    ifLoadedStartup()
})
loadLang("en", function() {
    loadedLang = true
    ifLoadedStartup()
})

function ifLoadedStartup() {
    if (loadedLang && loadedSteem) {
        // init the navbar
        window.navbar = document.getElementById('navbar-container')
        navbar.innerHTML = template('navbar.html', proxy)
        bind.navbar()
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

        // start router
        Router.navigate(Router.getFragment());
        Router.check()

        // hide the loader
        pageloader.classList.remove('is-active')
    }
}
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
        window.addEventListener("hashchange", function(){
            console.log('hashchange')
            Router.check()
            Router.navigate(Router.getFragment());
        }, false);
        
    },
    navigate: function(path) {
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

// adding routes
Router
.add(/about/, function() {
    document.getElementById('content').innerHTML = template('about.html', {})
})
.add(/addannounce/, function() {
    document.getElementById('content').innerHTML = template('addannounce.html', {})
})
.add(/addcategory/, function() {
    document.getElementById('content').innerHTML = template('addcategory.html', {})
})
.add(/products\/(.*)\/edit\/(.*)/, function() {
    console.log('products', arguments);
})
.add(function() {
    document.getElementById('content').innerHTML = template('404.html', {})
})
.listen()
// load categories
function loadSteem(cb) {
    steem.api.getState('marketplace/@'+config.root_category, function(e,r) {
        var tree = buildTree(r.content, config.root_category.split('/')[0], config.root_category.split('/')[1])
        proxy.categories = tree
        cb()
    })
}

function buildTree(content, rootAuthor, rootPermlink) {
    var root = content[rootAuthor+'/'+rootPermlink]
    var comments = []
    for (var i = 0; i < root.replies.length; i++) {
      var comment = {
        category: content[root.replies[i]].category,
        body: content[root.replies[i]].body,
        author: content[root.replies[i]].author,
        permlink: content[root.replies[i]].permlink,
        total_payout_value: content[root.replies[i]].total_payout_value,
        curator_payout_value: content[root.replies[i]].curator_payout_value,
        pending_payout_value: content[root.replies[i]].pending_payout_value
      }
      comment.children = buildTree(content, content[root.replies[i]].author, content[root.replies[i]].permlink)
      comments.push(comment)
    }
    comments = comments.sort(function(a,b) {
      var diff = parseInt(b.total_payout_value.split(' ')[0].replace('.',''))
        +parseInt(b.curator_payout_value.split(' ')[0].replace('.',''))
        +parseInt(b.pending_payout_value.split(' ')[0].replace('.',''))
        -parseInt(a.total_payout_value.split(' ')[0].replace('.',''))
        -parseInt(a.curator_payout_value.split(' ')[0].replace('.',''))
        -parseInt(a.pending_payout_value.split(' ')[0].replace('.',''))
      if (diff == 0) {
        return new Date(b.created) - new Date(a.created)
      } return diff
    })
    return comments
  }
