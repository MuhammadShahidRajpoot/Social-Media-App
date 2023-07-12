import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Register user

export const register = async(req,res)=>{
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body
        if (!firstName || !email || !password){
            return res.send({message: "user name , password and email is required."})
        }
        // checking whether user record is already available or not ?
        // const existingUser = await User.findOne({email})
        // if(existingUser){
        //     return res.status(200).send({
        //         success: true,
        //         message: "user already exists"
        //     });
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt)
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: passwordHash,
                picturePath,
                friends,
                location,
                occupation,
                viewedProfile: Math.floor(Math.random()* 10000),
                impressions: Math.floor(Math.random()* 10000)
            })
            const savedUser = await  newUser.save()
            res.status(201).json(savedUser)
        } catch (err) {
            res.status(500).json({ error: err.message });
    }
}


//login controller

export const login = async(req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(400).json({message: "user does not exist."});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: "invalid credentials."});
        }
        const token = Jwt.sign({ id: user._id }, process.env.JWT_SECERET);
        delete user.password;
        res.status(200).json({ token, user})
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}