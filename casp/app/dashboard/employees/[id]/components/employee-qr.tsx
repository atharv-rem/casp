"use client"

import { qrcodeDataURI } from "etiket"

type qrtype = {
  url: string
  size?: number
  logoDataUri?: string
}

export function EmployeeQR({ url, size = 60, logoDataUri }: qrtype) {
  const qrSrc = qrcodeDataURI(url, {
    margin: 2,
    dotType: "dots",
    color: "#000000",
    dotSize: 1,
    ecLevel:"H",
    logo: logoDataUri
      ? {
          imageUrl: logoDataUri,
        }
      : undefined,
  })

  return <img src={qrSrc} alt="QR Code" width={size} height={size} />
}
