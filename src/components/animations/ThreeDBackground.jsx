import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

/* eslint-disable react-hooks/rules-of-hooks */
function Stars() {
	const ref = useRef();
	const sphere = useMemo(
		() =>
			new Float32Array(
				Array.from({ length: 5000 }, () => [
					(Math.random() - 0.5) * 20,
					(Math.random() - 0.5) * 20,
					(Math.random() - 0.5) * 20,
				]).flat()
			),
		[]
	);

	// useFrame is a hook from react-three/fiber that must be used inside Canvas context
	useFrame((state, delta) => {
		if (ref.current) {
			ref.current.rotation.x -= delta / 10;
			ref.current.rotation.y -= delta / 15;
		}
	});

	return (
		<group rotation={[0, 0, Math.PI / 4]}>
			<Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
				<PointMaterial
					transparent
					color="#6366f1"
					size={0.05}
					sizeAttenuation={true}
					depthWrite={false}
				/>
			</Points>
		</group>
	);
}
/* eslint-enable react-hooks/rules-of-hooks */

const ThreeDBackground = () => {
	return (
		<div className="fixed inset-0 -z-10">
			<Suspense fallback={null}>
				<Canvas camera={{ position: [0, 0, 1] }}>
					<Stars />
				</Canvas>
			</Suspense>
		</div>
	);
};

export default ThreeDBackground;
