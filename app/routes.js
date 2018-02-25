var User            = require('../app/models/user');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });


    app.get('/score', isLoggedIn, function(req, res) {
      User.find({}, function(err, users) {
        if (err) throw err;

        // object of all the users
        console.log(users);
        res.render('score.ejs', {
          users: users
        });
      });
    });

    app.post('/score', isLoggedIn, function(req, res) {
      console.log("Inside /score POST");
      saveScore(req, res);

      User.find({}, function(err, users) {
        if (err) throw err;

        // object of all the users
        console.log(users);
        res.render('score.ejs', {
          users: users
        });
      });

    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    // =====================================
    // Process signup ======================
    // =====================================
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // LOGIN ==============================
    // =====================================
    app.post('/login', passport.authenticate('local-login', {
      successRedirect : '/profile',
      failureRedirect : '/login',
      failureFlash : true
    }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function saveScore(req, res) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
  process.nextTick(function() {
    //User.findOne({ 'local.username' :  user}, function(err, user) {
    //console.log("Inside findOne");
    User.findOne( {"local.username": req.user.local.username}, function(err, user) {
      var oldScore = user.local.score;
      var newScore = req.body.score;
      if( newScore >= oldScore) {
        user.set({"local.score": newScore});
        user.save(function(err, updatedUser) {
          console.log("updated score to: " + req.body.score);
          if( err)
            console.log("error!");
        });

        if( user.local.finished == false  && req.body.finished == true) {
          user.set({"local.finished": true});
          user.save(function(err, updatedUser) {
            console.log("updated finished status to true");
            if( err)
              console.log("error!");
          });
        } else {
          console.log("didn't update because finished was false...");
        }
      } else {
        console.log("didn't update because oldScore was better...");
      }
    });

    //User.findOneAndUpdate(

    //{"local.username" : req.user.local.username},
    //{$set: {"local.score": req.body.score, "local.finished": req.body.finished}},
    //{new: true},
    //(err, req) => {
    //if(err) console.log(err);
    //return true;
    //}
    //);
  });

}
