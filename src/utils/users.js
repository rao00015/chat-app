const users = []    

// addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room}) => {

    //clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return{
            error : 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return{
            error : 'Username is in use!'
        }
    }

    //Store the user
    const user = {id, username, room}
    users.push(user)
    return {user}
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}
addUser({
    id : 2,
    username : 'chirag',
    room : 'philly'
})

addUser({
    id : 3,
    username : 'monica',
    room : 'philly'
})

addUser({
    id : 4,
    username : 'cherry',
    room : 'chile'
})


const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room === room)
    return usersInRoom
}



console.log(users)
const gettinguser = getUser(2)

console.log(gettinguser)

const usersInRoom = getUsersInRoom('philly')

console.log(usersInRoom)
//Removing User
// const removedUser = removeUser(2)

// console.log(removedUser)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}