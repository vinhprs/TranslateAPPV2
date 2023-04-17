const auth = require('../models/auth');

function login(req, res) {
  // render the login page
  res.render('login', { title: 'Express' });
}

function login_activity(req, res) {
    // get data from the form
    const { username, password } = req.body;
    // check if the username and password are correct in the database
    auth.findOne({ username, password }, (err, data) => {
        if (err) {
            res.status(500).send("Error");
        } else {
            if (data) {
                var sess = req.session; 
                sess.daDangNhap = true;
                sess.username = data["username"];
                res.redirect('/all-list');
            } else {
                res.redirect('/login');
            }
        }
    });
}

// logout remove session
function logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
}

module.exports = {
    login,
    logout,
    login_activity
}