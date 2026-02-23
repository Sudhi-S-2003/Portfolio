import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSystem() {
	const meshRef = useRef();
	const count = 2000;

	const positions = useMemo(() => {
		const positions = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 50;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
		}
		return positions;
	}, []);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
			meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
		}
	});

	return (
		<Points ref={meshRef} positions={positions} stride={3} frustumCulled={false}>
			<PointMaterial
				transparent
				color="#6366f1"
				size={0.1}
				sizeAttenuation={true}
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</Points>
	);
}

const ParticleField = () => {
	return (
		<div className="fixed inset-0 -z-10 pointer-events-none">
			<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
				<ParticleSystem />
			</Canvas>
		</div>
	);
};

export default ParticleField;
