import amqplib from 'amqplib/callback_api'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
dotenv.config()

const mail = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL_ADDR,
    pass: process.env.EMAIL_PWD,
  },
})

amqplib.connect(process.env.RABBITMQ_URL, (error0, connection) => {
  if (error0) {
    throw error0
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1
    }
    const queueMail = 'mail'
    channel.assertQueue(queueMail, { durable: false })
    console.log(
      ' [*] Waiting for messages in %s. To exit press CTRL+C',
      queueMail
    )
    channel.consume(queueMail, function (msg) {
      console.log(' [x] Received %s', msg.content.toString())
      let result = JSON.parse(msg.content.toString())
      console.log(result)
      mail.sendMail(result, (error, info) => {
        if (error) {
          console.log(error)
          console.error(error.stack)
          return channel.nack(msg)
        } else {
          console.log('Email sent: ' + info.response)
          console.log('Delivered message %s', info.messageId)
          channel.ack(msg)
        }
      })
    })
  })
})
