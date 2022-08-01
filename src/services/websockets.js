import { Server } from "socket.io";
import { io } from "../../app.js";
import { cartServices, messageServices, productServices } from "../models/DAOs/daos.js";
import { client, loggerConsole, loggerError, TEST_MAIL, transporter } from "./users.services.js";


export const socket = async (socket) => {
        loggerConsole.info('new user')
    
        let products = await productServices.get()
        let messages = await (await messageServices.getMessages()).payload
        io.emit('products',products)
        io.emit('messages',messages)
    
        socket.on('createCart', async data=>{
            let newCart = await cartServices.new()
            let cartID = newCart.payload[0]._id
            io.emit('cartCreated',{cart:newCart})
            socket.on('addProductToCart', async idProd=>{
                await cartServices.add(cartID,idProd)
                let cart = await cartServices.get(cartID)
                let prodInCartIds = cart.payload[0].products
                
                let prodInCart = []
                socket.emit('refreshCart',prodInCartIds)
                for (let i = 0; i < prodInCartIds.length; i++) {
                    const id = prodInCartIds[i];
                    let product = await productServices.getById(id)
                    
                    prodInCart.push(product.payload[0])
                    product = []
                }
                
                socket.emit('refreshCart',prodInCart)
            })
            socket.on('finishPurchase',async data=>{
                loggerConsole.info(data)
    
                let articulosPedido = ''
                let articulosPedidoWapp = ''
                for (let i = 0; i < data.length-1; i++) {
                    const articulo = data[i];
                    articulosPedidoWapp = articulosPedidoWapp+`
                    name: ${articulo.name}
                    price: ${articulo.price}
                    id: ${articulo.id}
    
                    `
                    articulosPedido = articulosPedido+`<ul><li>name: ${articulo.name}</li><li>price: ${articulo.price}</li><li>id: ${articulo.id}</li></ul><br>`
                }
    
    
                const mailOptions2 = {
                    from: 'servidor de node js',
                    to: TEST_MAIL,
                    subject: `nuevo pedido de ${data[data.length-1].user} , email ${data[data.length-1].email} `,
                    html: `lista de pedido:<br> ${articulosPedido}`
                }
            
                
                try {
                    const info = await transporter.sendMail(mailOptions2)
                    loggerConsole.info(info)
    
                    const message = await client.messages.create({
                        body:'pedido recibido y en estado de procesamiento',
                        from: '+17245387231',
                        to: data[data.length-1].phone
                    })
                    loggerConsole.info(message)
    
                    const whatsapp = await client.messages.create({
                        body: `nuevo pedido de ${data[data.length-1].user} , email ${data[data.length-1].email}
                         ${articulosPedidoWapp}`,
                        from: 'whatsapp:'+'+14155238886',
                        to: 'whatsapp:'+data[data.length-1].phone
                    })
                    loggerConsole.info(whatsapp)
    
                } catch (err) {
                    loggerError.error(err)
                    loggerConsole.error(err)        
                }
    
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    await cartServices.deleteProd(cartID,element.id)
                }
            })
        })

        socket.on('message', async data => {
            console.log(data)
            let message = {...data}
        
            await messageServices.addMessage(message.email,message.type,message.message)
            .then(r=>console.log(r))
            let messages = await (await messageServices.getMessages()).payload
            io.emit('messages',messages)

        })
}