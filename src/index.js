
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
// app.set('view engine', 'html')

// app.get('', (req, res) => {
//     res.render('index')
// })

let message = "welcome!"

io.on('connection', (socket) => {
    console.log('web socket connection')
    
    // socket.emit('showMessage', message)
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdated', count)
    // })

    

    socket.on('join', ({username, room}, callback) => {

        const  {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('showMessage', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('showMessage', generateMessage('Admin', `${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    
    })


    socket.on('sendMessage', (messageValue, whatever) => {

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(messageValue)){
            return whatever('profanity is not allowed!')
        }

        io.to(user.room).emit('showMessage', generateMessage(user.username, messageValue))

        whatever('Delivered!')
    })

    socket.on('disconnect', () => {
        
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('showMessage', generateMessage(user.username, (`${user.username} has left`)))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersinRoom(user.room)
            })
        }


    })

    socket.on('sendLocation', (cordinates, callback) => {

        const user = getUser(socket.id)


        io.to(user.room).emit('locationMessage', generateMessage(user.username, 'https://google.com/maps?q='+ cordinates.latitude + ',' + cordinates.longitude))

        const locationMessage = 'Location shared bro'
        callback(locationMessage)
    })

})

server.listen(port, () => {
    console.log('Server is running on the port')
})