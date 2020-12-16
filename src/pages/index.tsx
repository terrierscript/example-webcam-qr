import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { BrowserQRCodeReader } from "@zxing/browser"
import unique from "just-unique"
import { Flex } from '@chakra-ui/react'
// import {BrowserQRCodeReader} from "@zxing/library"

function useDevices() {
  const [deviceAndCaps, setDeviceAndCaps] = useState([])
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0)
  
  useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const deviceAndCaps = devices
          .filter(({ kind }) => kind === "videoinput")
          .map(d => {
            // @ts-expect-error
            if (typeof d.getCapabilities !== "function") {
              return null
            }
            // @ts-expect-error
            return { device: d, capabilities: d.getCapabilities() }
          }).filter(item => !!item)

        deviceAndCaps.sort((a, b) => {
          if (a.capabilities.facingMode === "environment") {
            return -1
          }
          if (b.capabilities.facingMode === "environment") {
            return 1
          }
        })
        setDeviceAndCaps(deviceAndCaps)
      })
    }, [])
  return {
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % deviceAndCaps.length)
    },
    device: deviceAndCaps[currentDeviceIdx]?.device,
    deviceAndCaps
  }
}

const QrCodeReader = ({onReadQR}) => {
  const { device,deviceAndCaps } = useDevices()
  const deviceId = device?.id
  const codeReader = useRef(new BrowserQRCodeReader())
  const ref = useRef()
  useEffect(() => {
    codeReader.current.decodeFromVideoDevice(device, ref.current, (r) => {
      if (r) {
        onReadQR(r)
      }
    })
  },[deviceId])
  return <div>
    <video ref={ref}/>
    <pre>{JSON.stringify(deviceAndCaps,null,2)}</pre>
  </div>
  
}

export default function Home() {
  const [qrCodes, setQrCodes] = useState([])
  console.log(qrCodes)
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex>
        <QrCodeReader onReadQR={({ text }) => {
          console.log("ONREAD",text)
          setQrCodes((codes) => {
            return unique([text, ...codes])
          })
        }}/>
        <div>
          {qrCodes.map(qr => <div key={qr}>{qr}</div>)}
        </div>
      </Flex>
    </div>
  )
}
