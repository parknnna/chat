import React from 'react'
import ReactDOM from 'react-dom'
import styles from './styles.js'
// Socket.IO로 웹 소켓 서버에 접속하기 --- (※1)
import socketio from 'socket.io-client'
import background from "./bb.jpg"

const socket = socketio.connect('http://3.34.142.21:80')
// 입력 양식 컴포넌트 --- (※2)
class ChatForm extends React.Component {
  inputRef;
  constructor (props) {
    super(props)
    this.state = { name: '', message: '' 
    ,searchRef: React.createRef()
    }
  this.send = this.send.bind(this)
    
  }
  nameChanged (e) {
    this.setState({name: e.target.value})
  }
  messageChanged (e) {
    this.setState({message: e.target.value})
  }
  // 서버에 이름과 메시지 전송 --- (※3)
  send () {
    socket.emit('chat-msg', {
      name: window.sessionStorage.getItem("name"),
      message: this.state.message
    })
    this.state.searchRef.current.focus();
    this.setState({message: ''}) // 입력 양식을 비웁니다.
  }
  render () {
    return (
      <div style={styles.form} >
        메시지:
        <input value={this.state.message} ref = {this.state.searchRef} style={{width:"80%"}}
          onChange={e => this.messageChanged(e)} 
          onKeyPress={
            (e)=>{if(e.key==='Enter'){
              this.send()
            }
          }}/>
        <button onClick={this.send} >전송</button>
      </div>
    )
  }
}
// 채팅 애플리케이션의 메인 컴포넌트를 정의합니다. --- (※4)
class ChatApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      logs: [],
      name:""
    }
    this.nameChange = this.nameChange.bind(this);
    this.submit = this.submit.bind(this);
  }
  // 컴포넌트가 마운트됐을 때 --- (※5)
  componentDidMount () {
    // 실시간으로 로그를 받게 설정
    socket.on('chat-msg', (obj) => {
      const logs2 = this.state.logs
      obj.key = 'key_' + (this.state.logs.length + 1)
      console.log(obj)
      logs2.unshift(obj) // 로그에 추가하기
      this.setState({logs: logs2})
    })
  }

  nameChange(e){
    this.setState({
      name: e.target.value
    })
  }

  submit(){
    window.sessionStorage.setItem("name",this.state.name)
    this.setState({name:window.sessionStorage.getItem("name")})
  }


  render () {
    // 로그를 사용해 HTML 요소 생성 --- (※6)
    const chartHeight = window.innerHeight-100;
    const messages = this.state.logs.slice(0).reverse().map(e => (
      <div>
        {e.name === window.sessionStorage.getItem("name")?
        <div key={e.key} style={styles.log2}>
          <span style={styles.msg2}>{e.message} : 나</span>
          <p style={{clear: 'both'}} />
        </div>:
        <div key={e.key} style={styles.log}>
          <span style={styles.name}>{e.name}</span>
          <span style={styles.msg}>: {e.message}</span>
          <p style={{clear: 'both'}} />
        </div>
        }
      </div>
    ))
    return (
      <div>
        {window.sessionStorage.getItem("name")===null ?
        <div>
          <input onChange={(e)=>{this.nameChange(e)}} value={this.state.name}></input> <button onClick={this.submit}>submit</button>
        </div>
        :
        <div style={{border: "1px solid black"}}>
          <div style={{overflow:"scroll", width:"100%", height:`${chartHeight}px`, backgroundImage: `url(${background})`}}>{messages}</div>
          <ChatForm/>
        </div>
        }
      </div>
    )
  }
}

ReactDOM.render(
  <ChatApp />,
  document.getElementById('root'))