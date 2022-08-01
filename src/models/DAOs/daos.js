import dotenv from 'dotenv'

dotenv.config()

let persistencia = process.env.PERSISTENCIA

let productServices
let cartServices
let messageServices
switch (persistencia) {
            case 'mongo':
                let mongo = await import('../mongo/manager/mongoManager.js')
                productServices = new mongo.ProductManager()
                cartServices = new mongo.CartManager()
                messageServices = new mongo.MessageManager()
                break;
            default:
                let daoDefault = await import('../mongo/manager/mongoManager.js')
                productServices = new daoDefault.ProductManager()
                cartServices = new daoDefault.CartManager()
                messageServices = new mongo.MessageManager()
                break;
}
export {productServices, cartServices, messageServices}