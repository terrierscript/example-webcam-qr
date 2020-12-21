import React, { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser"
import unique from "just-unique"
import { Box, Button, Center, ChakraProvider, Container, CSSReset, Fade, Flex, Heading, Table, Tbody, Td, Tr } from '@chakra-ui/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

function useTrackAndCapabilities() {
  const [tracks, setTracks] = useState<MediaStreamTrack[]>([])
  const [error, setError] = useState<unknown>()

  useEffect(
    () => {
      try {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          const tracks = stream.getTracks()
          setTracks(tracks)
        })
      } catch (e) {
        setError(e)
      }
    }, [])
  return { tracks, error }
}

function sortTracksByFacingMode(tracks: MediaStreamTrack[]) {
  const trackAndCapabilities = tracks.map(track => {
    return {track, capabilities: track.getCapabilities()}
  })

  const sortedDevices = [...trackAndCapabilities].sort((a, b) => {
    if (a.capabilities.facingMode.includes("environment")) {
      return -1
    }
    if (b.capabilities.facingMode.includes("environment")) {
      return 1
    }
  }).map((dev) => {
    return dev.track
  })

  return sortedDevices
}

function useQrCameraChoose() {
  const { tracks, error } = useTrackAndCapabilities()
  const [devices, setDevices] = useState([])
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0)

  useEffect(() => {
    const sortedDevices = sortTracksByFacingMode(tracks)
    console.log(sortedDevices)
    setDevices(sortedDevices)
  }, [tracks])
    
  return {
    error,
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % devices.length)
    },
    currentDevice: devices[currentDeviceIdx],
  }
}


const QrCameraVideo = ({ deviceId, onReadQRCode }) => {
  const codeReader = useRef(new BrowserQRCodeReader())
  const controlsRef = useRef<IScannerControls|undefined>()
  const videoRef = useRef()

  useEffect(() => {
    console.log("id",deviceId)
    if (!deviceId || !videoRef.current) {
      return
    }
    codeReader.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, error, controls) => {
      if (error) {
        console.error(error)
        return
      }
      if (result) {
        onReadQRCode(result)
      }
      controlsRef.current = controls
    })
    return () => {
      if (!controlsRef.current) {
        return
      }
      return controlsRef.current.stop()
    }
  }, [deviceId])

  return <video
    style={{ maxWidth: "100%", maxHeight: "100%" }}
    ref={videoRef}
  /> 
 
}
const QrCodeReader = ({ onReadQRCode}) => {
  const { currentDevice, error, switcDevice } = useQrCameraChoose()
  const currentDeviceId = currentDevice?.id
  
  if (error) {
    return <div>This browser cannot use camera</div>
  }

  return <Box>
    <QrCameraVideo
      deviceId={currentDeviceId} onReadQRCode={onReadQRCode}
    /> 
    <Button colorScheme="blue" onClick={switcDevice}>
      Switch Camera
    </Button>
  </Box>
}

const QrCodeResult = ({qrCodes}) => {
  return <Table>
    <Tbody>
      {qrCodes.map(qr => <Tr key={qr}>
        <Td>
          <Fade in={true}>{qr}</Fade>
        </Td>
      </Tr>)}
    </Tbody>
  </Table>
}

const App = () => {
  const [tap, setTap] = useState(false)
  const [qrCodes, setQrCodes] = useState([])
  
  // if (!tap) {
  //   return <Container>
  //     <Center>
  //       <Button onClick={() => setTap(true)}>Start QR Reader</Button>
  //     </Center>
  //   </Container>
  // }

  return <Container>
    <Flex flexDirection="column">
      <Box flex={1} height={"50vh"}>
        <QrCodeReader onReadQRCode={({ text }) => {
          setQrCodes((codes) => {
            return unique([text, ...codes])
          })
        }}/>
      </Box>
      <Box flex={1} height={"50vh"}>
        <Heading>Result</Heading>
        <QrCodeResult qrCodes={qrCodes}/>
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
