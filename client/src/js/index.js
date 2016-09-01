import mqtt from 'mqtt'

class MqttDemo {
    constructor(userName, email) {
        this.username = userName
        this.email = email
        this.clientId = this.email.replace(/([@.+-_]?)/g, '')

        this.client = mqtt.connect('wss://karoaws.tk:3002', {
            keepalive: 30,
            clientId: this.clientId,
            will: {
                topic: `mqtt/user/${this.clientId}/presence`,
                payload: JSON.stringify({ userName: this.username, status: 0 }),
                qos: 0,
                retain: true
            },
            clean: false,
        })

        this.client.on('connect', () => {
            this.online()
            // console.log('success')
        })
        this.client.on('error', (err) => {
            console.log(err)
            this.client.end()
        })
        this.client.on('message', (topic, message) => {
            const msg = JSON.parse(message.toString())
            // console.log(topic, msg)

            const presence = topic.match(/mqtt\/user\/([^\s]+)\/presence/)
            if (presence !== null) {
                this.presence(presence[1], msg)
            }

            const re = new RegExp(`mqtt/user/${this.clientId}/chat/([^\\s]+)`)
            const chatMsg = topic.match(re)
            if (chatMsg != null) {
                this.revChatMessage(chatMsg[1], msg)
            }
        })
    }

    online() {
        this.client.publish(`mqtt/user/${this.clientId}/presence`, JSON.stringify({ userName: this.username, status: 1 }), { qos: 0, retain: true })
        this.client.subscribe('mqtt/user/+/presence')
        this.client.subscribe(`mqtt/user/${this.clientId}/chat/+`, { qos: 1 })
    }

    presence(clientId, messages) {
        if (clientId === this.clientId) return

        const ran = Math.floor(Math.random() * 20) + 1
        const gender = ran % 2 == 1 ? 'men' : 'women'
        const status = messages.status == 0 ? 'offline' : 'online'
        const template = this.tempClientList(clientId, messages, status, gender, ran)

        if ($(`#${clientId}`).length == 0) {
            $('#sidebar-wrapper ul.list').append(template)
            $(`#${clientId}`).on('click', () => {
                $('.people-list li').removeClass('active')
                $(`#${clientId}`).addClass('active')
                this.chatHeader(clientId)
            })
        } else {
            $(`#${clientId}`).find('.status').html(`<i class="fa fa-circle ${status}"></i> ${status}`)
            if (messages.status) {
                $(`#${clientId}`).find('img').addClass('online')
            } else {
                $(`#${clientId}`).find('img').removeClass('online')
            }
        }
    }

    revChatMessage(clientId, message) {
        this.dealWithMessage(clientId, message)

        if ($('.chat-header').data('id') == clientId) {
            $('.chat-history ul').append(this.tempFriendMessage(message))

            this.chatScrollTop()
        }
    }

    dealWithMessage(clientId, message) {
        if (!window.localStorage['chat/' + clientId]) {
            const array = [message]
            window.localStorage['chat/' + clientId] = JSON.stringify(array)
        } else {
            let chatHistory = JSON.parse(window.localStorage['chat/' + clientId])

            if (chatHistory.length < 10) {
                chatHistory.push(message)
                chatHistory.sort(this.sortTimestamp)
            } else {
                const front = chatHistory.slice(0, chatHistory.length - 10)
                const behind = chatHistory.slice(chatHistory.length - 10, 10)
                behind.push(message)
                behind.sort(this.sortTimestamp)
                chatHistory = front.concat(behind)
            }
            window.localStorage['chat/' + clientId] = JSON.stringify(chatHistory)
        }
    }

    dealWithChatHistory(clientId) {
        if (window.localStorage['chat/' + clientId]) {
            $('.chat-history').find('ul')
            const chatHistory = JSON.parse(window.localStorage['chat/' + clientId])

            chatHistory.forEach((elem) => {
                if (elem.clientId === this.clientId) {
                    $('.chat-history ul').append(this.tempMyMessage(elem))
                } else {
                    $('.chat-history ul').append(this.tempFriendMessage(elem))
                }
            })

            this.chatScrollTop()
        }
    }

    sortTimestamp(a, b) {
        if (a.timestamp < b.timestamp) {
            return -1
        } else if (a.timestamp > b.timestamp) {
            return 1
        }
        return 0
    }

    chatHeader(clientId) {
        const temp = $(`#${clientId}`).clone()
        temp.find('.status').remove()
        $('.chat-header').html(temp.html())
        $('.chat-history').find('ul').html('')
        $('.chat-message').html('')
        // for revMessage
        $('.chat-header').data('id', clientId)

        $('.chat-message').append(this.tempChatMessage())
        $('.chat-message button').on('click', () => {
            this.sendMsg(clientId)
        })
        $('.chat-message textarea').on('keyup', (event) => {
            if (!$('.chat-message textarea').val()) return
            if (event.keyCode == 13 && !event.shiftKey) {
                //避免打中文字選字時送出
                const content = $('.chat-message textarea').val()
                if (content.substring(content.length - 1, content.length) !== '\n') return

                this.sendMsg(clientId)
            }
        })

        this.dealWithChatHistory(clientId)
        setInterval(this.updateMoment, 60000)
    }

    sendMsg(clientId) {
        if (!$('.chat-message textarea').val()) return

        const text = $('.chat-message textarea').val()
        const time = new Date()
        const message = {
            timestamp: time.valueOf(),
            message: text,
            clientId: this.clientId
        }
        this.client.publish(`mqtt/user/${clientId}/chat/${this.clientId}`, JSON.stringify(message), { qos: 1 })
        $('.chat-message textarea').val('')

        this.dealWithMessage(clientId, message)
        $('.chat-history ul').append(this.tempMyMessage(message))
        this.chatScrollTop()
    }

    chatScrollTop() {
        const scrollH = $('.chat-history')[0].scrollHeight
        const outerH = $('.chat-history').outerHeight()
        $('.chat-history').scrollTop(scrollH - outerH)
    }

    updateMoment() {
        $('.message-data-time').each(function() {
            const time = $(this).data('time')
            $(this).text(moment(time).locale('zh-tw').fromNow())
        })
    }

    /* ---- template ---- */
    tempClientList(clientId, messages, status, gender, ran) {
        const template = `<li id="${clientId}" class="clearfix">
                            <img ${messages.status == 0 ? '' : 'class="online"'} src="https://randomuser.me/api/portraits/thumb/${gender}/${ran}.jpg" alt="avatar" />
                            <div class="about">
                                <div class="name">${messages.userName}</div>
                                <div class="status">
                                    <i class="fa fa-circle ${status}"></i> ${status}
                                </div>
                            </div>
                        </li>`.replace(/[\n\t]+/g, '')

        return template
    }

    tempChatMessage() {
        const template = `<div class="col-sm-12">
                            <textarea class="form-control" name="message-to-send" id="message-to-send" placeholder ="Type your message. Shift+Enter for new line" rows="3"></textarea>
                        </div>
                        <div class="col-sm-2 col-sm-offset-10">
                            <button class="btn btn-primary">Send</button>
                        </div>`.replace(/[\n\t]+/g, '')

        return template
    }

    tempMyMessage(message) {
        const template = `<li class="clearfix">
                            <div class="message-data align-right">
                              <span class="message-data-time" data-time="${message.timestamp}">${moment(message.timestamp).locale('zh-tw').fromNow()}</span>
                              <span class="message-data-name">${this.username}</span> <i class="fa fa-circle me"></i>
                            </div>
                            <div class="message my-message">
                              ${message.message.replace(/[\r\n]/g, '<br />')}
                            </div>
                          </li>`.replace(/[\n\t]+/g, '')

        return template
    }

    tempFriendMessage(message) {
        const username = $(`#${message.clientId}`).find('.name').text()
        const status = $(`#${message.clientId}`).find('img').attr('class')
        const template = `<li class="clearfix">
                            <div class="message-data">
                              <span class="message-data-name"><i class="fa fa-circle ${status !== undefined ? status : 'offline'}"></i> ${username}</span>
                              <span class="message-data-time" data-time="${message.timestamp}">${moment(message.timestamp).locale('zh-tw').fromNow()}</span>
                            </div>
                            <div class="message friend-message">
                              ${message.message.replace(/[\r\n]/g, '<br />')}
                            </div>
                          </li>`.replace(/[\n\t]+/g, '')

        return template
    }
}

let _mqttDemo

if (!window.localStorage['userName'] || !window.localStorage['email']) {
    $('#myModal').modal('show')
    $('#modalSubmit').on('click', () => {
        const username = $('#modalInputUsername').val()
        const email = $('#modalInputEmail').val()
        if (!username || !email) {
            alert('username and email is required!!!')
            return
        }

        window.localStorage['userName'] = username
        window.localStorage['email'] = email
        _mqttDemo = new MqttDemo(username, email)
        $('#myModal').modal('hide')
    })
} else {
    _mqttDemo = new MqttDemo(window.localStorage['userName'], window.localStorage['email'])
}

module.exports = _mqttDemo
