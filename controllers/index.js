
const User = require('../models/user');
const passport = require('passport');

module.exports = {
    // POST /register
	postRegister(req, res, next) {
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			image: req.body.image
		})
		User.register(newUser, req.body.password, (err) => {
			if(err) {
				console.log("error while user register", err);
				return next(err);
			}
			console.log('User Registered');
			res.redirect('/');
		});
	}
}