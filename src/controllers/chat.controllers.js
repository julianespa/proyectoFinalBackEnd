import { messageServices } from "../models/DAOs/daos.js";

export const chatPage = (req,res,next) => {
    if(req.isAuthenticated()) return res.render('chat')
    res.redirect('/')
}