import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from "@zxing/browser"
import unique from "just-unique"
import { Box, ChakraProvider, Container, CSSReset, Fade, Flex, Heading, Table, Tbody, Td, Tr } from '@chakra-ui/react'

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

export default function Home() {
  const [qrCodes, setQrCodes] = useState([])
  return (
    <div>
      <ChakraProvider>
        <Container>
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
      </ChakraProvider>
    </div>
  )
}
