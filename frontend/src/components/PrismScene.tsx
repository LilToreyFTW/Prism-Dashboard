import { Float, Line, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { PrismNode } from '../types/api';

type Props = {
  nodes: PrismNode[];
};

function PrismCore() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.25;
      mesh.current.rotation.y += delta * 0.38;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[1.8, 0]} />
        <meshPhysicalMaterial color="#7dd3fc" roughness={0.12} metalness={0.2} transmission={0.35} thickness={0.8} emissive="#3b82f6" emissiveIntensity={0.4} wireframe={false} />
      </mesh>
    </Float>
  );
}

function Nodes({ nodes }: Props) {
  const points = useMemo(() => nodes.map((node) => new THREE.Vector3(node.x, node.y, node.z)), [nodes]);
  return (
    <>
      {nodes.map((node) => (
        <mesh key={node.id} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.08 + node.value / 900, 24, 24]} />
          <meshStandardMaterial color={node.value > 80 ? '#f472b6' : '#37d5ff'} emissive={node.value > 80 ? '#db2777' : '#0891b2'} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {points.length > 1 && <Line points={points} color="#a855f7" lineWidth={1.2} transparent opacity={0.55} />}
    </>
  );
}

export default function PrismScene({ nodes }: Props) {
  return (
    <Canvas className="h-full w-full">
      <PerspectiveCamera makeDefault position={[0, 0.8, 7]} fov={48} />
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 5, 6]} intensity={38} color="#37d5ff" />
      <pointLight position={[-4, -2, 3]} intensity={22} color="#a855f7" />
      <Stars radius={80} depth={45} count={1200} factor={3} fade speed={0.4} />
      <PrismCore />
      <Nodes nodes={nodes} />
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.35} minDistance={4} maxDistance={10} />
    </Canvas>
  );
}
