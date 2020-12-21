import React, { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser"
import unique from "just-unique"
import { Box, Button, Center, ChakraProvider, Container, CSSReset, Fade, Flex, Heading, Table, Tbody, Td, Tr } from '@chakra-ui/react'
import { ErrorBoundary } from '../components/ErrorBoundary'


const QrCodeReader = ({ onReadQRCode}) => {
  const codeReader = useRef(new BrowserQRCodeReader())
  const controlsRef = useRef<IScannerControls|undefined>()
  const videoRef = useRef()

  useEffect(() => {
    codeReader.current.decodeFromVideoDevice(
      // undefinedを指定すると、勝手にfacingModeを指定してくれる。see: https://github.com/zxing-js/browser/blob/dd2e5fc8d5849c044d0db21b9e0dc5fdc76e0c4c/src/readers/BrowserCodeReader.ts#L771-L775
      undefined,
      videoRef.current, (result, error, controls) => {
      if (error) {
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
      
      controlsRef.current.stop()
      controlsRef.current = null
    }
  }, [])

  return <video
    style={{ maxWidth: "100%", maxHeight: "100%",height:"100%" }}
    ref={videoRef}
  /> 
 
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
  const [qrCodes, setQrCodes] = useState([])

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
