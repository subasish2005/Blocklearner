import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, MeshDistortMaterial, Trail, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// Component PropTypes
const BlockNode = ({ position, text, color, isActive }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const nodeInfo = {
    Genesis: {
      icon: '🌟',
      details: 'Genesis Block',
      stats: 'Block Height: 0',
      description: 'The foundation of our blockchain network'
    },
    'Smart Contract': {
      icon: '📜',
      details: 'Automated Agreements',
      stats: 'Transactions: 1.2M+',
      description: 'Self-executing contracts with predefined rules'
    },
    Token: {
      icon: '🪙',
      details: 'Digital Currency',
      stats: 'Market Cap: $2.5M',
      description: 'Native cryptocurrency powering the ecosystem'
    },
    NFT: {
      icon: '🎨',
      details: 'Digital Collectibles',
      stats: 'Total Minted: 10K',
      description: 'Unique digital assets with verified ownership'
    },
    DAO: {
      icon: '👥',
      details: 'Community Governance',
      stats: 'Members: 5K+',
      description: 'Decentralized decision-making platform'
    },
    DeFi: {
      icon: '💱',
      details: 'Financial Services',
      stats: 'TVL: $5M',
      description: 'Decentralized financial protocols'
    }
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    meshRef.current.rotation.y = Math.cos(time * 0.5) * 0.2;
    
    // Pulse effect when active
    if (isActive) {
      setPulseIntensity((Math.sin(time * 3) + 1) / 2);
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      position={position}
    >
      <group>
        {/* Outer glow sphere */}
        <Sphere args={[0.8, 32, 32]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05 + (isActive ? pulseIntensity * 0.1 : 0)}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Energy field */}
        <Sphere args={[0.6, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            transparent
            opacity={0.1}
            distort={0.3}
            speed={2}
          />
        </Sphere>

        {/* Main node */}
        <Trail
          width={0.2}
          length={8}
          color={color}
          attenuation={(t) => t * t}
        >
          <mesh
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <octahedronGeometry args={[0.4, 2]} />
            <MeshDistortMaterial
              color={color}
              speed={2}
              distort={hovered ? 0.6 : 0.4}
              radius={1}
              metalness={0.9}
              roughness={0.1}
              emissive={color}
              emissiveIntensity={isActive ? 2 + pulseIntensity : 0.4}
            />
          </mesh>
        </Trail>

        {/* Node label */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>

        {/* Info panel */}
        {(isActive || hovered) && (
          <Html position={[0, 0.8, 0]}>
            <div style={{ 
              background: 'rgba(0,0,0,0.8)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: `1px solid ${color}`,
              color: 'white',
              whiteSpace: 'nowrap',
              fontFamily: 'system-ui',
              transform: 'translateX(-50%)',
              minWidth: '220px',
              backdropFilter: 'blur(10px)',
              boxShadow: `0 0 30px ${color}40`,
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px', textAlign: 'center' }}>
                {nodeInfo[text].icon}
              </div>
              <div style={{ 
                color, 
                marginBottom: '6px', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {nodeInfo[text].details}
              </div>
              <div style={{ 
                color: '#a0aec0', 
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                {nodeInfo[text].stats}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: '#718096',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '8px',
                marginTop: '8px'
              }}>
                {nodeInfo[text].description}
              </div>
            </div>
          </Html>
        )}

        {/* Connection indicators */}
        {isActive && (
          <group>
            <mesh position={[0.6, 0, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )}
      </group>
    </Float>
  );
};

BlockNode.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  text: PropTypes.oneOf(['Genesis', 'Smart Contract', 'Token', 'NFT', 'DAO', 'DeFi']).isRequired,
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired
};

const ConnectionLine = ({ start, end, color, isActive }) => {
  const points = useMemo(() => {
    const linePoints = [];
    linePoints.push(new THREE.Vector3(...start));
    
    // Add multiple control points for more organic curve
    const midPoint = new THREE.Vector3(
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2
    );
    
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    
    midPoint.add(offset);
    
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      midPoint,
      new THREE.Vector3(...end)
    );
    
    const points = curve.getPoints(30);
    return points;
  }, [start, end]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={isActive ? 0.6 : 0.2}
        linewidth={2}
      />
    </line>
  );
};

ConnectionLine.propTypes = {
  start: PropTypes.arrayOf(PropTypes.number).isRequired,
  end: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired
};

const TokenReward = ({ startPosition, endPosition }) => {
  const particlesCount = 20;
  const ref = useRef();
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < particlesCount; i++) {
      pos.push(
        startPosition[0] + (Math.random() - 0.5) * 0.3,
        startPosition[1] + (Math.random() - 0.5) * 0.3,
        startPosition[2] + (Math.random() - 0.5) * 0.3
      );
    }
    return new Float32Array(pos);
  }, [startPosition]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.rotation.y = time * 0.2;
    ref.current.position.x += (endPosition[0] - startPosition[0]) * 0.01;
    ref.current.position.y += (endPosition[1] - startPosition[1]) * 0.01;
    ref.current.position.z += (endPosition[2] - startPosition[2]) * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={particlesCount}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#FFD700"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

TokenReward.propTypes = {
  startPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  endPosition: PropTypes.arrayOf(PropTypes.number).isRequired
};

const BlockchainNetwork = () => {
  const [activeNode, setActiveNode] = useState(0);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (time % 8 < 0.1) {
      setActiveNode((prev) => (prev + 1) % 6);
    }
  });

  const nodes = [
    { position: [-3, 2, 0], text: "Genesis", color: "#4f46e5" },
    { position: [0, 2, 0], text: "Smart Contract", color: "#10b981" },
    { position: [3, 2, 0], text: "Token", color: "#8b5cf6" },
    { position: [-3, -2, 0], text: "NFT", color: "#f59e0b" },
    { position: [0, -2, 0], text: "DAO", color: "#ef4444" },
    { position: [3, -2, 0], text: "DeFi", color: "#06b6d4" }
  ];

  return (
    <group>
      {nodes.map((node, index) => (
        <BlockNode
          key={index}
          {...node}
          isActive={activeNode === index}
        />
      ))}
      
      {/* Connection lines */}
      {nodes.map((start, i) => 
        nodes.map((end, j) => {
          if (i < j) {
            return (
              <ConnectionLine
                key={`${i}-${j}`}
                start={start.position}
                end={end.position}
                color={start.color}
                isActive={activeNode === i || activeNode === j}
              />
            );
          }
          return null;
        })
      )}
      
      {activeNode > 0 && (
        <TokenReward
          startPosition={nodes[activeNode].position}
          endPosition={nodes[(activeNode + 1) % nodes.length].position}
        />
      )}
    </group>
  );
};

const CommunityDashboard3D = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent'
        }}
        dpr={window.devicePixelRatio}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputEncoding: THREE.sRGBEncoding,
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <BlockchainNetwork />
      </Canvas>
    </div>
  );
};

export default CommunityDashboard3D;
