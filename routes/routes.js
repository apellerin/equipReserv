module.exports = function(app){

    app.get('/login', function(req, res){
        res.render('index', {
            title: 'Express Login'
        });
    });

    //other routes..
}