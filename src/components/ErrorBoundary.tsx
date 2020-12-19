import React from 'react'

export class ErrorBoundary extends React.Component<{}, any> {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    this.setState({
      error: [error, ...this.state.error]
    })
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <div>{JSON.stringify(this.state.error)}</div>
    }

    return this.props.children
  }
}
