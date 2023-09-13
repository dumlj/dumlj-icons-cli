import * as React from 'react'
import { ajax } from '../utils'

export const HTTP_REG =
  /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/

export interface Props {
  onDataSet?: (data) => void
  settingData: { webhook?: string; description?: string }
}

export default class Settings extends React.Component<Props> {
  state = {
    webhook: '',
    description: '',
    warning: '',
    success: '',
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  publish = () => {
    const { onDataSet } = this.props
    const { webhook, description } = this.state

    if (!webhook) {
      this.setState({ warning: 'webHook is required.' })
      return
    }
    if (!HTTP_REG.test(webhook)) {
      this.setState({ warning: 'webHook is illegal.' })
      return
    }
    if (!description) {
      this.setState({ warning: 'description is required.' })
      return
    }

    this.setState({ warning: '' })

    const data = {
      description,
      webhook,
    }

    parent.postMessage({ pluginMessage: { type: 'setSettingData', data } }, '*')

    onDataSet(data)

    ajax({
      url: webhook,
      data: {
        desc: description,
      },
      method: 'GET',
      success: () => {
        this.setState({
          success: 'Notify success!',
        })

        setTimeout(() => {
          this.setState({
            success: '',
          })
        }, 5000)
      },
    })
  }

  componentDidUpdate(preProps) {
    const { settingData } = this.props
    if (preProps.settingData !== settingData) {
      this.setState({
        webhook: settingData.webhook,
      })
    }
  }

  render() {
    const { webhook, description, warning, success } = this.state
    return (
      <>
        {warning && <div className="form-item alert-warning type--pos-medium-normal">{warning}</div>}
        {success && <div className="form-item alert-success type--pos-medium-normal">{success}</div>}
        <div className="form-item">
          <input
            name="webhook"
            className="input"
            placeholder="Webhook callBack URL"
            onChange={this.handleChange}
            value={webhook}
          />
        </div>
        <div className="form-item">
          <input
            name="description"
            className="input"
            maxLength={100}
            placeholder="Add this description for this version"
            onChange={this.handleChange}
            value={description}
          />
        </div>
        <div className="form-item">
          <button className="button button--primary button-block" onClick={this.publish}>
            Publish
          </button>
        </div>
      </>
    )
  }
}
