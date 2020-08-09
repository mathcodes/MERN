const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post( '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
 
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // email below is same as email:email but already declared just above a few lines.
      let user = await User.findOne({ email });
      console.log({ User })
     //see if user exists, 
      if (user) {
        return res
          // 400 BC ITS A bad request
          .status(400)
          // And what I'm going to do here is I want to match the same type of error response that we get up here
          // from this body stuff which is an array of errors.

          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        }),
        { forceHttps: true }
      );
  // create the user
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // ENCRYPT PASSWORD 
      const salt = await bcrypt.genSalt(10);
      // HASH THE PASSWORD
      user.password = await bcrypt.hash(password, salt);
      // SAVE USER IN DB
      await user.save();
      // GET THE PAYLOAD  
      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };
      // SIGN THE TOKEN
      jwt.sign(
        //PASS THE PAYLOAD
        payload,
        //...THE SECRET
        config.get('jwtSecret'),
        //...EXP DATE
        { expiresIn: '5 days' },
        
        (err, token) => {
          // check for the error, 'throw err' will give us a 200 response 
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
