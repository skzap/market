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