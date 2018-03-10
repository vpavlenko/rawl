/*
  Usage
  node wait-server.js 8080 && node run-something.js
*/
const { Socket } = require("net")
const port = process.argv[2]
const client = new Socket()

console.log(`wating for port ${port}...`)

const tryConnection = () => client.connect({ port }, () => {
  client.end()
})

tryConnection()

client.on("error", (error) => {
  setTimeout(tryConnection, 1000)
})
