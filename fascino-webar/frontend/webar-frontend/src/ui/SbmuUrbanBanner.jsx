import React from "react"
import ArFrame from "./ArFrame"

const banner = `${import.meta.env.BASE_URL}assets/banner/sbmu-banner.png`
const video = `${import.meta.env.BASE_URL}videos/SBMU.mp4`

export default function SbmuUrbanBanner({ onVideoPlaying }) {
  return <ArFrame banner={banner} video={video} onVideoPlaying={onVideoPlaying} />
}



