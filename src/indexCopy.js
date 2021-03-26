import amqplib from 'amqplib/callback_api'
import dotenv from 'dotenv'

dotenv.config()
const receive = (error0, connection) => {
  if (error0) {
    throw error0
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }
    var queue = 'hello'
    channel.assertQueue(queue, {
      durable: false,
    })

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue)

    channel.consume(
      queue,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString())
      },
      {
        noAck: true,
      }
    )
  })
  connection.createChannel(function (error1, channel2) {
    if (error1) {
      throw error1
    }
    const queueTodo = 'todo'
    channel2.assertQueue(queueTodo, {
      durable: false,
    })
    console.log(
      ' [*] Waiting for messages in %s. To exit press CTRL+C',
      queueTodo
    )

    channel2.consume(
      queueTodo,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString())
        var result = JSON.parse(msg.content.toString())
        console.log(result)
      },
      {
        noAck: true,
      }
    )
  })
}

amqplib.connect(process.env.RABBITMQ_URL, receive)
