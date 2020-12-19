import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { BrowserQRCodeReader } from "@zxing/browser"
import unique from "just-unique"
import { Flex } from '@chakra-ui/react'


function useDevicesAndCapabilities() {
  const [deviceAndCaps, setDeviceAndCaps] = useState([])

  useEffect(
    () => {
      navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
        const tracks = stream.getTracks()
        return tracks
          // .filter(({ kind }) => kind === "videoinput")
          .map(d => {
            return {device: d, capabilities: d.getCapabilities()}
          })
      })
    //   navigator.mediaDevices.enumerateDevices().then((devices) => {
    //     const deviceAndCaps = devices
    //       .filter(({ kind }) => kind === "videoinput")
    //       .map((d) => {
    //         // @ts-expect-error
    //         if (typeof d.getCapabilities !== "function") {
    //           return null
    //         }
    //         // @ts-expect-error
    //         return { device: d, capabilities: d.getCapabilities() }
    //       }).
    //       filter(item => !!item)
    //     setDeviceAndCaps(deviceAndCaps)
    //   })
    }, [])
  return deviceAndCaps
}

function useDevices() {
  const _deviceAndCaps = useDevicesAndCapabilities()
  const [devices, setDevices] = useState([])
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0)

  useEffect(() => {
    const sortedDevices = _deviceAndCaps.sort((a, b) => {
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
  }, [_deviceAndCaps])
  
  
  return {
    switcDevice: () => {
      setCurrentDeviceIdx((currentDeviceIdx + 1) % devices.length)
    },
    device: devices[currentDeviceIdx],
  }
}

const QrCodeReader = ({onReadQR}) => {
  const { device } = useDevices()
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
    <pre>{JSON.stringify(device,null,2)}</pre>
  </div>
  
}

export default function Home() {
  const [qrCodes, setQrCodes] = useState([])
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
