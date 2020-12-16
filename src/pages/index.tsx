import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { BrowserQRCodeReader } from "@zxing/browser"
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
            if (typeof d.capabilities) {
              return null
            }
            // @ts-expect-error
            return { device: d, capabilities: d.getCapabilities() }
          }).filter(item => !!item)

        deviceAndCaps.sort((a, b) => {
          if (a.capabilities.facingMode === "environment") {
            return 1
          }
          if (b.capabilities.facingMode === "environment") {
            return -1
          }
        })
        setDeviceAndCaps(deviceAndCaps)
      })
    }, [])
  return {
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % deviceAndCaps.length)
    },
    device: deviceAndCaps[currentDeviceIdx]?.device
  }
}


export default function Home() {
  const { device } = useDevices()
  const deviceId = device?.id
  const codeReader = useRef(new BrowserQRCodeReader())
  useEffect(() => {
    if (!deviceId) {
      return 
    }
    codeReader.current.decodeOnceFromStream(device)
  },[deviceId])

  return (
    <div >
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Webcam
        audio={false}
        videoConstraints={{deviceId: device?.id}}
        // videoConstraints={{ facingMode: { exact: "environment" } }}
        // onError={e =>console.log(e)}
        onUserMedia={(stream) => {
          console.log(stream)
          // codeReader.current.decodeOnceFromVideoDevice(stream)
        }}
      />
      <div>a</div>
    </div>
  )
}
