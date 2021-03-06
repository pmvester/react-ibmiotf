import React from 'react';
import './App.css';

var appConfig = require('./AppConfig.json')
var iotfApp = require('ibmiotf').IotfApplication
const uuidv4 = require('uuid/v4')

var appClient = new iotfApp(appConfig)
appClient.id = uuidv4()
console.log(appClient.id)

function Pressure(props) {
  return (
    <h1>{props.pressure} hPa</h1>
  )
}

function Temperature(props) {
  return (
    <h1>{props.temperature} °C</h1>
  )
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pressure: 1013.0,
      temperature: 23.0
    }

    this.onMessage = this.onMessage.bind(this);
  }

  onMessage(type, id, eventType, eventFormat, payload, topic) {
    const msg = JSON.parse(payload.toString());
    console.log(topic);
    console.log(msg);
    if (topic.search('pressure') >= 0) {
      this.setState({ pressure: msg.pressure / 100.0})
    } else if (topic.search('temperature') >= 0) {
      this.setState({ temperature: msg.temperature })
    }
  }

  componentDidMount() {
    appClient.connect()
    appClient.on('connect', () => {
      appClient.subscribeToDeviceEvents("MV_Barometer","MV_barometer1","pressure")
      appClient.subscribeToDeviceEvents("MV_Thermometer","MV_thermometer1","temperature")
    });
    appClient.on('deviceEvent', this.onMessage);
  }

  componentWillUnmount() {
    appClient.disconnect()
  }

  render() {
    return (
      <div className="App">
        <div>
        <Pressure pressure={this.state.pressure} />
        <Temperature temperature={this.state.temperature} />
        </div>
      </div>
    );
  }
}