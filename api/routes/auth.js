const router=require("express").Router()
const User =require("../models/User")
const CryptoJs =require("crypto-js")
const jwt =require("jsonwebtoken")

//REGISTER
router.post("/register", async (req,res)=>{     
    const newUser=new User({
       username: req.body.username,
       email: req.body.email,
       password: CryptoJs.AES.encrypt(req.body.password,process.env.Pass_Sec).toString() ,     
    })
    try{
        const savesUser= await newUser.save()
        res.status(201).json(savesUser)
    }
    catch(err){    
        res.status(500).json(err)
    }
})

//LOGIN
router.post("/login", async (req,res)=>{
    try{
        const user= await User.findOne({username: req.body.username})
        !user &&  res.status(401).json("Wrong Credentials!")
        const hashedPassword=CryptoJs.AES.decrypt(user.password,process.env.Pass_Sec)
        const Originalpassword=hashedPassword.toString(CryptoJs.enc.Utf8)
        Originalpassword !== req.body.password && res.status(401).json("Wrong Credentials!")

        const accessToken=jwt.sign({
            id:user._id,
            isAdmin:user.isAdmin,
        }, process.env.Jwt_Sec,
           {expiresIn:"3d"}
    )
        
        const {password, ...others }=user._doc
        res.status(200).json({...others,accessToken})
    }
    catch(err){
        res.status(500).json(err)
    }
})

module.exports=router