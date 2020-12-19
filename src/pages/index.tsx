import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from "@zxing/browser"
import unique from "just-unique"
import { Box, ChakraProvider, Container, CSSReset, Fade, Flex, Heading, Table, Tbody, Td, Tr } from '@chakra-ui/react'
import { error } from 'console'

class ErrorBoundary extends React.Component<{}, any> {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error };
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
      return <h1>{JSON.stringify(this.state.error)}</h1>;
    }

    return this.props.children; 
  }
}

function useDevicesAndCapabilities() {
  const [trackAndCaps, setTrackAndCaps] = useState([])

  useEffect(
    () => {
      navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
        const tracks = stream.getTracks()
        const deviceAndCaps = tracks
          .map(track => {
            return {track: track, capabilities: track.getCapabilities()}
          })
          setTrackAndCaps(deviceAndCaps)
      })
    }, [])
  return trackAndCaps
}

function useDevices() {
  const deviceAndCaps = useDevicesAndCapabilities()
  const [devices, setDevices] = useState([])
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0)

  useEffect(() => {
    const sortedDevices = deviceAndCaps.sort((a, b) => {
      if (a.capabilities.facingMode === "environment") {
        return -1
      }
      if (b.capabilities.facingMode === "environment") {
        return 1
      }
    }).map((dev) => {
      return dev.device
    })
    setDevices(sortedDevices)
  }, [deviceAndCaps])
    
  return {
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % devices.length)
    },
    device: devices[currentDeviceIdx],
  }
}


const QrCodeReader = ({ onReadQRCode}) => {
  const { device } = useDevices()
  const deviceId = device?.id
  const codeReader = useRef(new BrowserQRCodeReader())
  const ref = useRef()
  useEffect(() => {
    codeReader.current.decodeFromVideoDevice(device, ref.current, (r) => {
      if (r) {
        onReadQRCode(r)
      }
    })
  }, [deviceId])
  return <video style={{ maxWidth: "100%", maxHeight: "100%" }} ref={ref}/> 
}

const App = () => {
  const [qrCodes, setQrCodes] = useState([])
  return <Container>
    <Flex maxW="100vw" maxH="100vh" flexDirection="column">
      <Box flex={1} height={"50vh"}>
        <QrCodeReader onReadQRCode={({ text }) => {
          setQrCodes((codes) => {
            return unique([text, ...codes])
          })
        }}/>
      </Box>
      <Box flex={1} height={"50vh"}>
        <Heading>Result</Heading>
        <Table>
          <Tbody>
            {qrCodes.map(qr => <Tr key={qr}>
              <Td>
                <Fade in={true}>{qr}</Fade>
              </Td>
            </Tr>)}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  </Container>
}
export default function Home() {
  return (
    <div>
      <ErrorBoundary>
        <ChakraProvider>
          <App/>
        </ChakraProvider>
      </ErrorBoundary>
    </div>
  )
}
