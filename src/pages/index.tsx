import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from "@zxing/browser"
import unique from "just-unique"
import { Box, Button, ChakraProvider, Container, CSSReset, Fade, Flex, Heading, Table, Tbody, Td, Tr } from '@chakra-ui/react'
import { error } from 'console'
import { ErrorBoundary } from '../components/ErrorBoundary'

function useTrackAndCapabilities() {
  const [trackAndCapabilities, setTrackAndCaps] = useState([])
  const [isError, setIsError] = useState(false)

  useEffect(
    () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setIsError(true)
      }
      navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
        const tracks = stream.getTracks()
        const deviceAndCaps = tracks
          .map(track => {
            return {track: track, capabilities: track.getCapabilities()}
          })
          setTrackAndCaps(deviceAndCaps)
      })
    }, [])
  return { trackAndCapabilities, isError }
}

function useDevices() {
  const { trackAndCapabilities, isError } = useTrackAndCapabilities()
  const [devices, setDevices] = useState([])
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0)

  useEffect(() => {
    if(isError){
      return
    }
    const sortedDevices = trackAndCapabilities.sort((a, b) => {
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
  }, [trackAndCapabilities, isError])
    
  return {
    isError,
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % devices.length)
    },
    currentDevice: devices[currentDeviceIdx],
  }
}


const QrCodeReader = ({ onReadQRCode}) => {
  const { currentDevice, isError, switcDevice } = useDevices()
  const deviceId = currentDevice?.id
  const codeReader = useRef(new BrowserQRCodeReader())
  const ref = useRef()
  useEffect(() => {
    codeReader.current.decodeFromVideoDevice(currentDevice, ref.current, (r) => {
      if (r) {
        onReadQRCode(r)
      }
    })
  }, [deviceId])
  if (isError) {
    return <div>This browser cannot use camera</div>
  }
  return <Box>
    <video
      style={{ maxWidth: "100%", maxHeight: "100%" }}
      ref={ref}
    /> 
    <Button colorScheme="blue" onClick={switcDevice}>
      Switch Camera
    </Button>
  </Box>
}

const App = () => {
  const [qrCodes, setQrCodes] = useState([])
  return <Container>
    <Flex  flexDirection="column">
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
