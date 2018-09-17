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