
const socket = io()
let message = document.getElementById('inputMessage')
let form = document.getElementById('form')
const $messageFormInput = form.querySelector('input')
const $messageFormButton = form.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkTemplate = document.querySelector('#link-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username , room } = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //container height 
    const containerHeight = $messages.scrollHeight

    //how far I have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
         $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('showMessage', (messageValue) => {
    console.log(messageValue)

    const html = Mustache.render(messageTemplate , {
        username : messageValue.username,
        messages : messageValue.text,
        createdAt : moment(messageValue.createdAt).format('hh:mm a')
    })


    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)

    const html = Mustache.render(linkTemplate, ({
        username : url.username,
        messages : url.text,
        createdAt : moment(url.createdAt).format('hh:mm a')
    }))

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

form.addEventListener('submit', (e) => {

    $messageFormButton.setAttribute('disabled', 'disabled')
    let messageValue = message.value
    // console.log(messageValue)

    socket.emit('sendMessage', messageValue, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
         
        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!')
    })

    e.preventDefault()
})  

$sendLocationButton.addEventListener('click', () => {
    
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by the browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {

        let cordinates = {latitude : position.coords.latitude, longitude : position.coords.longitude}
        socket.emit('sendLocation', cordinates, (locationMessage) => {
            console.log(locationMessage)
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) => {

    if(error) {
        alert(error)
        location.href = '/'
    }
})