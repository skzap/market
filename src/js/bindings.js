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
