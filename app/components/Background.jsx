"use client"

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export default function Background() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <div className="w-full h-full">
        <ShaderGradientCanvas>
            <ShaderGradient
                animate="on"
                axesHelper="on"
                bgColor1="#000000"
                bgColor2="#000000"
                brightness={1.2}
                cAzimuthAngle={180}
                cDistance={2.4}
                cPolarAngle={95}
                cameraZoom={1}
                color1="#121417"
                color2="#297356"
                color3="#19332C"
                destination="onCanvas"
                embedMode="off"
                envPreset="city"
                format="gif"
                fov={45}
                frameRate={10}
                gizmoHelper="hide"
                grain="off"
                lightType="3d"
                pixelDensity={1}
                positionX={0}
                positionY={-2.1}
                positionZ={0}
                range="disabled"
                rangeEnd={40}
                rangeStart={0}
                reflection={0.1}
                rotationX={0}
                rotationY={0}
                rotationZ={225}
                shader="defaults"
                type="plane"
                uAmplitude={0}
                uDensity={1.8}
                uFrequency={5.5}
                uSpeed={0.2}
                uStrength={2.5}
                uTime={0.2}
                wireframe={false}
            />
        </ShaderGradientCanvas>
      </div>
    </div>
  )
}