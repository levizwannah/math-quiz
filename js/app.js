fetchContext(['global'], 'Groups.Urgent');
mediators(['Game']);


const gc = context('global');
gc.root = h.dom.querySelector('#root');

route.orOn(['/', 'index', 'index.html'], function(){
    req('Groups.Index');

    h.Index(
        {
            parent: gc.root,
            resetParent: route.reset
        }
    )
});

route.listen();