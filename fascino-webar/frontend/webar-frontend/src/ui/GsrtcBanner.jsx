import React from "react"
import ArFrame from "./ArFrame"

const banner = `${import.meta.env.BASE_URL}assets/banner/gsrtc-banner.png`
const video = `${import.meta.env.BASE_URL}videos/GSRTC.mp4`

export default function GsrtcBanner({ onVideoPlaying }) {
  return <ArFrame banner={banner} video={video} onVideoPlaying={onVideoPlaying} />
}



