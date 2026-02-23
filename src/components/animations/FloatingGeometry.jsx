import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';

/* eslint-disable react-hooks/rules-of-hooks */
function FloatingSphere({ position, color, speed = 1 }) {
	const meshRef = useRef();

	// useFrame is a hook from react-three/fiber that must be used inside Canvas context
	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.x += 0.01 * speed;
			meshRef.current.rotation.y += 0.01 * speed;
			meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
		}
	});

	return (
		<Sphere ref={meshRef} args={[1, 100, 200]} position={position}>
			<MeshDistortMaterial
				color={color}
				attach="material"
				distort={0.3}
				speed={2}
				roughness={0.1}
				metalness={0.8}
				transparent
				opacity={0.6}
			/>
		</Sphere>
	);
}
/* eslint-enable react-hooks/rules-of-hooks */

const FloatingGeometry = () => {
	return (
		<>
			<FloatingSphere position={[-5, 2, -5]} color="#6366f1" speed={0.5} />
			<FloatingSphere position={[5, -2, -5]} color="#a855f7" speed={0.7} />
			<FloatingSphere position={[0, 0, -8]} color="#ec4899" speed={0.6} />
		</>
	);
};

export default FloatingGeometry;
