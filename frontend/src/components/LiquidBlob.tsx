import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function LiquidBlob() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      // Add a slight floating effect
      mesh.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <Sphere ref={mesh} args={[1.5, 64, 64]} position={[0, 0, 0]}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={5}
        thickness={2}
        chromaticAberration={1}
        anisotropy={1}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.2}
        iridescence={1}
        iridescenceIOR={1}
        iridescenceThicknessRange={[0, 1400]}
        color="#8B5CF6" // Violet tint
      />
    </Sphere>
  );
}