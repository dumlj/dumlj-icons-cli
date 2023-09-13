import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Settings from './components/Settings'
import '../assets/ds.css'
import './style.css'

class App extends React.Component {
  state = {
    settingData: null,
  }

  onDataSet = (settingData?) => {
    this.setState({
      settingData: settingData,
    })
  }

  componentDidMount() {
    window.onmessage = async (event) => {
      const msg = event.data.pluginMessage
      switch (msg.type) {
        case 'settingDataGot':
          if (msg.settingData) {
            this.setState({
              settingData: msg.settingData,
            })
          }
          break
      }
    }
  }
  render() {
    const { settingData } = this.state

    return (
      <div className="container">
        <Settings settingData={settingData} onDataSet={this.onDataSet} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
