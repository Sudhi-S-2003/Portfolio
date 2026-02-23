import { Suspense } from 'react';
import FloatingGeometry from './FloatingGeometry';

let Canvas, OrbitControls, PerspectiveCamera, Environment;
try {
	const r3f = require('@react-three/fiber');
	const drei = require('@react-three/drei');
	Canvas = r3f.Canvas;
	OrbitControls = drei.OrbitControls;
	PerspectiveCamera = drei.PerspectiveCamera;
	Environment = drei.Environment;
} catch (e) {
	console.warn('Three.js libraries not loaded');
}

function Scene() {
	return (
		<>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} intensity={1} />
			<pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
			<FloatingGeometry />
			<Environment preset="night" />
		</>
	);
}

const Hero3DScene = () => {
	if (!Canvas) {
		return (
			<div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
		);
	}

	return (
		<div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
			<Canvas>
				<Suspense fallback={null}>
					<PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
					<OrbitControls
						enableZoom={false}
						enablePan={false}
						autoRotate
						autoRotateSpeed={0.5}
					/>
					<Scene />
				</Suspense>
			</Canvas>
		</div>
	);
};

export default Hero3DScene;
