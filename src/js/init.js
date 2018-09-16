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

