const { Router } = require('express');
const router = Router();
//const session = require('express-session');
const front = require('./front');
const userRoute = require("./front.js");
const { mail } = require('../helper/mailer');

router.get('/sendMail', async (req, res) => {
  console.log('yes');
  await mail('shanakhan@questglt.org', 'Dummy', 'dummy');
})

  router.use(userRoute );


module.exports = router;