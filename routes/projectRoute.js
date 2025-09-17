const { authentication, restrictTo } = require("../controllers/authController");
const { createProject, getAllProject } = require("../controllers/projectController");

 const router=require("express").Router();

 router.route('/').post(authentication,restrictTo('1'),createProject)
 .get(authentication,getAllProject)
//  router.route('/').post()

 module.exports=router;